import { IsEmail } from 'class-validator';
import { Message } from 'src/messages/entities/message.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Person {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Column({ type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @CreateDateColumn()
  ceatedAt?: Date;

  @UpdateDateColumn()
  updateAt?: Date;

  @OneToMany(() => Message, message => message.from)
  sentMessages: Message[];

  @OneToMany(() => Message, message => message.to)
  receivedMessages: Message[];
}
