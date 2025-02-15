import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MessageModule } from 'src/messages/message.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonModule } from 'src/person/person.module';
import { ConfigModule, ConfigType } from '@nestjs/config';
import globalConfig from 'src/global-config/global.config';
import { GlobalConfigModule } from 'src/global-config/global-config.module';
import { AuthModule } from 'src/auth/auth.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'node:path';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60, blockDuration: 50000 }]),
    GlobalConfigModule,
    ConfigModule.forFeature(globalConfig),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule.forFeature(globalConfig)],
      inject: [globalConfig.KEY],
      useFactory: async (
        globalConfiguration: ConfigType<typeof globalConfig>,
      ) => ({
        type: globalConfiguration.database.type,
        host: globalConfiguration.database.host,
        port: globalConfiguration.database.port,
        username: globalConfiguration.database.username,
        database: globalConfiguration.database.database,
        password: globalConfiguration.database.password,
        autoLoadEntities: globalConfiguration.database.autoLoadEntities,
        synchronize: globalConfiguration.database.synchronize,
      }),
    }),
    MessageModule,
    PersonModule,
    AuthModule,
    ServeStaticModule.forRoot({
      serveRoot: path.resolve(__dirname, '..', '..', 'pictures'),
      rootPath: '/pictures',
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [],
})
export class AppModule {}
