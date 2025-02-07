import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { Repository } from 'typeorm';
import { Person } from 'src/person/entities/person.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { HashingServiceProtocol } from './hashing/hashing.service';
import jwtConfig from './config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,
    private readonly hashingServiceProtocol: HashingServiceProtocol,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly jwtService: JwtService,
  ) {}

  private async signJwtAsync<T>(sub: number, expiresIn: number, payload?: T) {
    return await this.jwtService.signAsync(
      {
        sub,
        ...payload,
      },
      {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
        expiresIn,
      },
    );
  }

  private async createTokens(person: Person) {
    const accessTokenPromise = this.signJwtAsync<Partial<Person>>(
      person.id,
      this.jwtConfiguration.jwtTtl,
      { name: person.name },
    );

    const refreshTokenPromise = this.signJwtAsync(
      person.id,
      this.jwtConfiguration.jwtRefreshTtl,
    );

    const [accessToken, refreshToken] = await Promise.all([
      accessTokenPromise,
      refreshTokenPromise,
    ]);

    return {
      refreshToken,
      accessToken,
    };
  }

  async login(loginDto: LoginDto) {
    let passwordIsValid = false;

    const person = await this.personRepository.findOneBy({
      email: loginDto.email,
      active: true,
    });

    if (person) {
      passwordIsValid = await this.hashingServiceProtocol.compare(
        loginDto.password,
        person.passwordHash,
      );
    } else {
      throw new UnauthorizedException('Person Unauthorized');
    }

    if (!passwordIsValid)
      throw new UnauthorizedException('Usuário ou senha incorretas');

    return this.createTokens(person);
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    try {
      const { sub } = await this.jwtService.verifyAsync(
        refreshTokenDto.refreshToken,
        this.jwtConfiguration,
      );

      const person = await this.personRepository.findOneBy({
        id: sub,
        active: true,
      });

      if (!person) throw new Error('Person Unauthorized');

      return this.createTokens(person);
    } catch (error) {
      if (error instanceof Error)
        throw new UnauthorizedException(error.message);

      if (typeof error === 'string') throw new UnauthorizedException(error);
    }
  }
}
