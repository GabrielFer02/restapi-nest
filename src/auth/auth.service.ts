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

  async login(loginDto: LoginDto) {
    let passwordIsValid = false;

    const person = await this.personRepository.findOneBy({
      email: loginDto.email,
    });

    if (person) {
      passwordIsValid = await this.hashingServiceProtocol.compare(
        loginDto.password,
        person.passwordHash,
      );
    }

    if (!passwordIsValid)
      throw new UnauthorizedException('Usuário ou senha incorretas');

    const accessToken = await this.signJwtAsync<Partial<Person>>(
      person.id,
      this.jwtConfiguration.jwtTtl,
      { name: person.name },
    );

    const refreshToken = await this.signJwtAsync(
      person.id,
      this.jwtConfiguration.jwtRefreshTtl,
    );

    return {
      refreshToken,
      accessToken,
    };
  }

  refreshTokens(refreshTokenDto: RefreshTokenDto) {}
}
