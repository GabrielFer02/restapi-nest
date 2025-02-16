import { Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { PersonModule } from 'src/person/person.module';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [TypeOrmModule.forFeature([Message]), PersonModule, EmailModule],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [],
})
export class MessageModule {}
