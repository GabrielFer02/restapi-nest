import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { Repository } from 'typeorm';
import { Person } from 'src/person/entities/person.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { HashingServiceProtocol } from './hashing/hashing.service';
import jwtConfig from './config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

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

    const accessToken = await this.jwtService.signAsync(
      {
        sub: person.id,
        name: person.name,
      },
      {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
        expiresIn: this.jwtConfiguration.jwtTtl,
      },
    );

    return {
      accessToken,
    };
  }
}
