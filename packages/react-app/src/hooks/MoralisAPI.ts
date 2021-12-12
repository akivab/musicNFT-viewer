import axios from "axios";
import {ApiKeys} from "../apiKeys/ApiKeys";

export interface MoralisInfo {
    token_address: string
    token_id: string
    metadata: MoralisMetadata
}

export interface MoralisMetadata {
    name: string
    description: string
    animation_url: string
}

export class MoralisAPI {
    getNftUrl(accountAddress: string) {
        return `https://deep-index.moralis.io/api/v2/${accountAddress}/nft?chain=eth&format=decimal`
    }

    getNFTs(accountAddress: string): Promise<MoralisInfo[]> {
        return axios({
            method: 'get',
            url: this.getNftUrl(accountAddress),
            headers: {
                'X-API-Key': ApiKeys.MORALIS_API_KEY,
                'accept': 'application/json'
            }
        }).then(res => {
            if (!res.data || !res.data.result) {
                return [];
            }
            const results = res.data.result.map((m: any) => {
                m.metadata = JSON.parse(m.metadata) as MoralisMetadata;
                return m;
            });
            // console.log(JSON.stringify(results));

            return results as MoralisInfo[];
        });
    }
}