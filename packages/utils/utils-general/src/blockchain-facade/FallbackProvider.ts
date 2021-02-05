import { ethers } from 'ethers';

export function getProviderWithFallback(
    ...rpcNodeUrls: string[]
): ethers.providers.FallbackProvider {
    return new ethers.providers.FallbackProvider(
        rpcNodeUrls.filter((url) => url).map((url) => new ethers.providers.JsonRpcProvider(url))
    );
}
