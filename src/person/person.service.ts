import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Person } from './entities/person.entity';
import { Repository } from 'typeorm';
import { HashingServiceProtocol } from 'src/auth/hashing/hashing.service';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';
import * as path from 'node:path';
import * as fs from 'fs/promises';

@Injectable()
export class PersonService {
  constructor(
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,
    private readonly hashingServiceProtocol: HashingServiceProtocol,
  ) {}

  notFoundException() {
    throw new NotFoundException('Person not Found');
  }

  async create(createPersonDto: CreatePersonDto) {
    try {
      const passwordHash = await this.hashingServiceProtocol.hash(
        createPersonDto.password,
      );

      const personData = {
        email: createPersonDto.email,
        name: createPersonDto.name,
        passwordHash,
      };

      const newPerson = this.personRepository.create(personData);
      await this.personRepository.save(newPerson);
      return newPerson;
    } catch (error) {
      if (error.code === '23505')
        throw new ConflictException('E-mail já cadastrado');

      throw error;
    }
  }

  async findAll() {
    const person = await this.personRepository.find({ order: { id: 'desc' } });
    return person;
  }

  async findOne(id: number) {
    const person = await this.personRepository.findOneBy({ id });

    if (!person) this.notFoundException();

    return person;
  }

  async update(
    id: number,
    updatePersonDto: UpdatePersonDto,
    tokenPayload: TokenPayloadDto,
  ) {
    const personData = {
      name: updatePersonDto.name,
    };

    if (updatePersonDto.password) {
      const passwordHash = await this.hashingServiceProtocol.hash(
        updatePersonDto.password,
      );
      personData['passwordHash'] = passwordHash;
    }

    const person = await this.personRepository.preload({
      id,
      ...personData,
    });

    if (!person) this.notFoundException();

    if (person.id !== tokenPayload.sub)
      throw new ForbiddenException('Unauthorized person');

    return this.personRepository.save(person);
  }

  async remove(id: number, tokenPayload: TokenPayloadDto) {
    const person = await this.personRepository.findOneBy({ id });

    if (!person) this.notFoundException();

    if (person.id !== tokenPayload.sub)
      throw new ForbiddenException('Unauthorized person');

    return this.personRepository.remove(person);
  }

  async uploadPicture(
    file: Express.Multer.File,
    tokenPayload: TokenPayloadDto,
  ) {
    if (file.size < 1024) throw new BadRequestException('File too small');

    const person = await this.personRepository.findOneBy({
      id: tokenPayload.sub,
    });

    if (!person) this.notFoundException();

    const fileExtension = path
      .extname(file.originalname)
      .toLowerCase()
      .slice(1);

    const fileName = `${tokenPayload.sub}.${fileExtension}`;
    const fileFullPath = path.resolve(process.cwd(), 'pictures', fileName);

    await fs.writeFile(fileFullPath, file.buffer);

    person.picture = fileName;
    await this.personRepository.save(person);

    return person;
  }
}
