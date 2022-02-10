const zlib = require('zlib')
const utf8 = require('utf8');
import { ResponseContract } from '@ioc:Adonis/Core/Response'

export default class Compression {
    static zipResponse(response: ResponseContract) {
         return new Promise(async (resolve, reject) => {
            response.header('Content-Encoding', 'gzip');
            response.header('Content-Type', 'application/json');
            const encoded = await utf8.encode(JSON.stringify(response.getBody()));
            await zlib.gzip(encoded, (err:any, result:any) => {
                if(err)
                    reject(err)
                console.log('after compression applied',err)
                resolve(result)
            })
        });
    }
}