import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersonService } from 'src/person/person.service';
import { PaginationDto } from 'src/app/common/dto/pagination.dto';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly personService: PersonService,
    private readonly emailService: EmailService,
  ) {}

  throwNotFoundError() {
    throw new NotFoundException('Message not found');
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const messages = await this.messageRepository.find({
      take: limit,
      skip: offset,
      relations: ['from', 'to'],
      order: {
        id: 'desc',
      },
      select: {
        from: { id: true, name: true },
        to: { id: true, name: true },
      },
    });
    return messages;
  }

  async findOne(id: number) {
    const message = await this.messageRepository.findOne({
      where: {
        id,
      },
      relations: { from: true, to: true },
      select: { from: { id: true, name: true }, to: { id: true, name: true } },
    });
    if (message) return message;

    this.throwNotFoundError();
  }

  async create(
    createMessageDto: CreateMessageDto,
    tokenPayload: TokenPayloadDto,
  ) {
    const from = await this.personService.findOne(tokenPayload.sub);
    const to = await this.personService.findOne(createMessageDto.toId);

    const newMessage = {
      text: createMessageDto.text,
      from,
      to,
      readed: false,
      ceatedAt: new Date(),
    };

    const message = this.messageRepository.create(newMessage);
    await this.messageRepository.save(message);

    await this.emailService.sendEmail(
      to.email,
      `Você recebeu um recado de ${from.name} `,
      createMessageDto.text,
    );

    return {
      ...message,
      from: {
        id: message.from.id,
        name: message.from.name,
      },
      to: {
        id: message.to.id,
        name: message.to.name,
      },
    };
  }

  async update(
    id: number,
    updateMessageDto: UpdateMessageDto,
    tokenPayload: TokenPayloadDto,
  ) {
    const message = await this.findOne(id);

    if (message.from.id !== tokenPayload.sub)
      throw new ForbiddenException('Action Unauthorized');

    message.text = updateMessageDto.text ?? message.text;
    message.readed = updateMessageDto.readed ?? message.readed;

    if (!message) return this.throwNotFoundError();

    await this.messageRepository.save(message);

    return message;
  }

  async remove(id: number, tokenPayload: TokenPayloadDto) {
    const message = await this.findOne(id);

    if (!message) return this.throwNotFoundError();

    if (message.from.id !== tokenPayload.sub)
      throw new ForbiddenException('Action Unauthorized');

    return this.messageRepository.remove(message);
  }
}
