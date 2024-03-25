import { Context, Schema, h } from 'koishi'
import Vits from '@initencounter/vits'

export const name = 'gpt-sovits'

class sovits extends Vits {
    declare logger: any
    constructor(ctx: Context, config: sovits.Config) {
        super(ctx)
        this.config = config
        this.logger = ctx.logger('sovits')

        ctx.command('sovits <text:string>', 'sovits语音合成帮助')
            .option(
                'cha_name',
                '-s [cha_name:string] 角色文件夹名称',
                { fallback: config.cha_name }
            )
            .option(
                'character_emotion',
                '-sr [character_emotion:nubmer] 角色情感',
                { fallback: config.character_emotion }
            )
            .option(
                'text_language',
                '-n [text_language:number] 文本语言',
                { fallback: config.text_language }
            )
            .option(
                'batch_size',
                '-nw [batch_size:number] 一次性几个batch',
                { fallback: config.batch_size }
            )
            .option(
                'speed',
                '-l [speed:number] 语速',
                { fallback: config.speed }
            )
            .option(
                'top_k',
                '-p [top_k:string] GPT模型参数',
                { fallback: config.top_k }
            )
            .option(
                'top_p',
                '-w [top_p:number] GPT模型参数',
                { fallback: config.top_p }
            )
            .option(
                'temperature',
                '-la [temperature:string] GPT模型参数',
                { fallback: config.temperature }
            )
            .action(
                async (s, text) => {
                if (!text) {
                    s.session.execute('sovits -h')
                    return null
                }

                this.config = { endpoint: config.endpoint, ...s.options }
                return await this.say({ input: text })
            })
    }

    async say(options: Vits.Result): Promise<import("@satorijs/element")> {
        const {
            endpoint,
            cha_name,
            character_emotion,
            text_language,
            batch_size,
            speed,
            top_k,
            top_p,
            temperature,
        } = this.config

        const payload = {
            cha_name,
            character_emotion,
            text: options.input,
            text_language,
            batch_size,
            speed,
            top_k,
            top_p,
            temperature
        }

        try {
            return h.audio(
                await this.ctx.http.post(
                    `${endpoint}/tts`,
                    payload,
                    { responseType: 'arraybuffer' }
                ), 'audio/mpeg'
            )
        } catch (error) {
            this.logger.error(`ERROR:`, error)
            return null
        }
    }
}

namespace sovits {
    export interface Config {
        endpoint: string,

        cha_name: string,
        character_emotion: string,
        text_language: '多语种混合'
            | '中文'
            | '日文'
            | '英文'
            | '中英混合'
            | '日英混合'

        batch_size: number,
        speed: number,
        top_k: number,
        top_p: number,
        temperature: number,
    }

    export const Config: Schema<Config> = Schema.object({
        endpoint: Schema.string()
            .required()
            .description('后端地址'),

        cha_name: Schema.string()
            .required()
            .description('角色文件夹名称'),

        character_emotion: Schema.string()
            .required()
            .description('角色情感'),

        text_language: Schema.union([
            '多语种混合',
            '中文',
            '日文',
            '英文',
            '中英混合',
            '日英混合'
        ]).default('多语种混合'),

        batch_size: Schema.number()
            .role('slider')
            .min(1)
            .max(35)
            .step(1)
            .default(10)
            .description('batch_size，1代表不并行，越大越快，但是越可能爆'),

        speed: Schema.number()
            .role('slider')
            .min(0.25)
            .max(4)
            .step(0.05)
            .default(1)
            .description('语速'),

        top_k: Schema.number()
            .role('slider')
            .min(1)
            .max(30)
            .step(1)
            .default(6)
            .description('GPT模型参数，不了解时无需修改'),

        top_p: Schema.number()
            .role('slider')
            .min(0)
            .max(1)
            .step(0.1)
            .default(0.8)
            .description('GPT模型参数，不了解时无需修改'),

        temperature: Schema.number()
            .role('slider')
            .min(0)
            .max(1)
            .step(0.1)
            .default(0.8)
            .description('GPT模型参数，不了解时无需修改'),
    })
}

export default sovits
