import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { GlobalConfigModule } from 'src/global-config/global-config.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import globalConfig from 'src/global-config/global.config';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'node:path';
import { MessageModule } from 'src/messages/message.module';
import { PersonModule } from 'src/person/person.module';
import { AuthModule } from 'src/auth/auth.module';
import { ParseIntIdPipe } from 'src/app/common/pipes/parse-int-id.pipe';
import { CreatePersonDto } from 'src/person/dto/create-person.dto';

const login = async (
  app: INestApplication,
  email: string,
  password: string,
) => {
  const response = await request(app.getHttpServer())
    .post('/auth')
    .send({ email, password });

  return response.body.accessToken;
};

const createUserAndLogin = async (app: INestApplication) => {
  const name = 'Any User';
  const email = 'any@gmail.com';
  const password = '123456';

  await request(app.getHttpServer())
    .post('/person')
    .send({ name, email, password });

  return login(app, email, password);
};

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        GlobalConfigModule,
        ConfigModule.forFeature(globalConfig),
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'postgres',
          database: 'testando',
          password: process.env.DATABASE_PASSWORD,
          autoLoadEntities: true,
          synchronize: true,
          dropSchema: true,
        }),
        MessageModule,
        PersonModule,
        AuthModule,
        ServeStaticModule.forRoot({
          serveRoot: path.resolve(__dirname, '..', '..', 'pictures'),
          rootPath: '/pictures',
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: false,
      }),
      new ParseIntIdPipe(),
    );

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/person (POST)', () => {
    it('deve criar uma pessoa com sucesso', async () => {
      const createPersonDto: CreatePersonDto = {
        email: 'gabriel@gmail.com',
        password: '123456',
        name: 'Gabriel',
      };
      const response = await request(app.getHttpServer())
        .post('/person')
        .send(createPersonDto)
        .expect(HttpStatus.CREATED);

      expect(response.body).toEqual({
        email: createPersonDto.email,
        name: createPersonDto.name,
        passwordHash: expect.any(String),
        active: true,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        picture: '',
        id: expect.any(Number),
      });
    });

    it('deve gerar um e-mail que já existe', async () => {
      const createPersonDto: CreatePersonDto = {
        email: 'gabriel@gmail.com',
        password: '123456',
        name: 'Gabriel',
      };

      await request(app.getHttpServer())
        .post('/person')
        .send(createPersonDto)
        .expect(HttpStatus.CREATED);

      const response = await request(app.getHttpServer())
        .post('/person')
        .send(createPersonDto)
        .expect(HttpStatus.CONFLICT);
      expect(response.body.message).toBe('E-mail já cadastrado');
    });

    it('deve gerar uma senha curta', async () => {
      const createPersonDto: CreatePersonDto = {
        email: 'gabriel@gmail.com',
        password: '123',
        name: 'Gabriel',
      };

      const response = await request(app.getHttpServer())
        .post('/person')
        .send(createPersonDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toContain(
        'password must be longer than or equal to 6 characters',
      );

      expect(response.body.message).toEqual([
        'password must be longer than or equal to 6 characters',
      ]);
    });
  });

  describe('/person/:id (GET)', () => {
    it('deve retornar Unauthorized quando o usuário não está logado', async () => {
      const createPersonDto: CreatePersonDto = {
        email: 'gabriel@gmail.com',
        password: '123456',
        name: 'Gabriel',
      };

      const personResponse = await request(app.getHttpServer())
        .post('/person')
        .send(createPersonDto)
        .expect(HttpStatus.CREATED);

      const response = await request(app.getHttpServer())
        .get('/person/' + personResponse.body.id)
        .expect(HttpStatus.UNAUTHORIZED);

      expect(response.body).toEqual({
        message: 'Não logado',
        error: 'Unauthorized',
        statusCode: 401,
      });
    });

    it('deve retornar a Pessoa quando o usuário está logado', async () => {
      const createPersonDto: CreatePersonDto = {
        email: 'gabriel@gmail.com',
        password: '123456',
        name: 'Gabriel',
      };

      const personResponse = await request(app.getHttpServer())
        .post('/person')
        .send(createPersonDto)
        .expect(HttpStatus.CREATED);

      const accessToken = await createUserAndLogin(app);

      const response = await request(app.getHttpServer())
        .get('/person/' + personResponse.body.id)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(HttpStatus.OK);

      expect(response.body).toEqual({
        email: createPersonDto.email,
        name: createPersonDto.name,
        passwordHash: expect.any(String),
        active: true,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        picture: '',
        id: expect.any(Number),
      });
    });
  });
});
