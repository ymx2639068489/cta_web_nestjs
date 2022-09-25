import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { TopicType, AnsEnum } from '@/enum/TopicType';
import { User } from '../users';

@Entity()
export class Question extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ enum: TopicType, type: 'enum' })
  type: TopicType;

  @Column()
  topic: string;

  @Column()
  optionA: string;

  @Column()
  optionB: string;

  @Column({ nullable: true })
  optionC: string;

  @Column({ nullable: true })
  optionD: string;
  @Column({ enum: AnsEnum, type: 'enum' })
  ans: AnsEnum;
}

@Entity()
export class TestPaper extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @JoinColumn()
  @OneToOne(() => User)
  user: User;

  @Column({ type: 'longtext' })
  questions: string;

  @Column({ type: 'int', nullable: true })
  score: number;

  @Column({ type: 'datetime' })
  startTime: Date;

  @Column({ type: 'int', nullable: true })
  totalDuration: number;
}
