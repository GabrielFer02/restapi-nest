import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { PaginationDto } from 'src/app/common/dto/pagination.dto';
import { AddHeaderInterceptor } from 'src/app/common/interceptors/add-header.interceptor';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.messageService.findAll(paginationDto);
  }

  @Get(':id')
  @UseInterceptors(AddHeaderInterceptor)
  findOne(@Param('id') id: number) {
    return this.messageService.findOne(id);
  }

  @Post()
  createPost(@Body() body: CreateMessageDto) {
    return this.messageService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() body: UpdateMessageDto) {
    return this.messageService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.messageService.remove(id);
  }
}
