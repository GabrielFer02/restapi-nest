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

  async create(body: CreateMessageDto) {
    const newMessage = {
      readed: false,
      ceatedAt: new Date(),
      ...body,
    };

    const message = await this.messageRepository.create(newMessage);

    return this.messageRepository.save(message);
  }

  async update(id: number, body: UpdateMessageDto) {
    const message = await this.messageRepository.preload({ id, ...body });

    if (!message) return this.throwNotFoundError();

    await this.messageRepository.save(message);

    return message;
  }

  async remove(id: number) {
    const message = await this.messageRepository.findOneBy({ id });

    if (!message) return this.throwNotFoundError();

    return this.messageRepository.remove(message);
  }
}
