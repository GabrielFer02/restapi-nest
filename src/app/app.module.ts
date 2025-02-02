import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MessageModule } from 'src/messages/message.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonModule } from 'src/person/person.module';
import { ConfigModule, ConfigType } from '@nestjs/config';
import globalConfig from 'src/global-config/global.config';
import { GlobalConfigModule } from 'src/global-config/global-config.module';

@Module({
  imports: [
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
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [],
})
export class AppModule {}
