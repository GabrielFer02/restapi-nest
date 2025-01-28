import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MessageModule } from 'src/messages/message.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonModule } from 'src/person/person.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      database: 'postgres',
      password: '5aaef876ce0a4f3caf9ea08d0859bd6c',
      autoLoadEntities: true,
      synchronize: true,
    }),
    MessageModule,
    PersonModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [],
})
export class AppModule {}
