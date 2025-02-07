import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { PaginationDto } from 'src/app/common/dto/pagination.dto';
import { AuthTokenGuadr } from 'src/auth/guards/auth-token.guard';
import { TokenPayloadParam } from 'src/auth/params/token-payload.param';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';
import { RoutePoliceGuard } from 'src/auth/guards/route-police.guard';
import { SetRoutePolicy } from 'src/auth/decorators/set-route-police.decorator';
import { RoutePolicies } from 'src/auth/enum/route-polices.enum';

@UseGuards(RoutePoliceGuard)
@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get()
  @SetRoutePolicy(RoutePolicies.findAllMessages)
  findAll(@Query() paginationDto: PaginationDto) {
    return this.messageService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.messageService.findOne(id);
  }

  @UseGuards(AuthTokenGuadr)
  @Post()
  createPost(
    @Body() body: CreateMessageDto,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.messageService.create(body, tokenPayload);
  }

  @UseGuards(AuthTokenGuadr)
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() body: UpdateMessageDto,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.messageService.update(id, body, tokenPayload);
  }

  @UseGuards(AuthTokenGuadr)
  @Delete(':id')
  remove(
    @Param('id') id: number,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.messageService.remove(id, tokenPayload);
  }
}
