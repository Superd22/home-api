import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'
import { TokenStatus } from '../api/interfaces/freebox-auth.interface'
import * as crypto from 'crypto'

@Entity()
export class FreeboxToken {

    @PrimaryGeneratedColumn()
    public id: string

    @Column({ nullable: true, type: 'simple-enum', enum: TokenStatus })
    public status: TokenStatus

    @Column()
    public trackId: number

    @Column()
    public appToken: string

    @Column({ nullable: true })
    public challenge?: string

    /**
     * Password to send to requests to freebox
     */
    public get password(): string {
        if (!this.challenge || !this.appToken) throw new Error(`Could not generate password, missing challenge/apptoken for token ${this.id}`)
        const password= crypto.createHmac('sha1', this.appToken, { encoding: 'utf8' })
            .update(this.challenge)
            .digest('hex')

            return password
    }

}
