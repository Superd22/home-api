import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class NodeEntity {

  @PrimaryColumn('varchar')
  public id!: string


  @Column('timestamp', { nullable: true })
  public lastTriggeredUp?: Date

}