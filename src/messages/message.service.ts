import { Injectable, NotFoundException } from '@nestjs/common';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  private lastId = 1;
  private message: Message[] = [
    {
      id: 1,
      text: 'recado de teste',
      from: 'Gabriel',
      to: 'Deus',
      readed: false,
      ceatedAt: new Date(),
    },
  ];

  throwNotFoundError() {
    throw new NotFoundException('Message not found');
  }

  async findAll() {
    const messages = await this.messageRepository.find();
    return messages;
  }

  async findOne(id: number) {
    const message = await this.messageRepository.findOne({
      where: {
        id,
      },
    });
    if (message) return message;

    this.throwNotFoundError();
  }

  create(body: CreateMessageDto) {
    const id = ++this.lastId;
    this.message.push({
      id,
      readed: false,
      ceatedAt: new Date(),
      ...body,
    });
  }

  update(id: number, body: UpdateMessageDto) {
    const indexMessage = this.message.findIndex(item => item.id === id);

    if (indexMessage < 0) this.throwNotFoundError();

    this.message[indexMessage] = {
      ...this.message[indexMessage],
      ...body,
    };
  }

  remove(id: number) {
    const indexMessage = this.message.findIndex(item => item.id === id);

    if (indexMessage < 0) this.throwNotFoundError();

    this.message.splice(indexMessage, 1);

    return this.message[indexMessage];
  }
}
