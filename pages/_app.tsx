import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, http } from 'wagmi'
import {
  arbitrum,
  goerli,
  mainnet,
  optimism,
  polygon,
  base,
  zora,
} from 'wagmi/chains';
import { RainbowKitProvider, connectorsForWallets} from '@rainbow-me/rainbowkit';
import { getDefaultConfig } from '@rainbow-me/rainbowkit'


import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import type { AppProps } from 'next/app';
import React, {useState, useEffect, forwardRef, useRef, useImperativeHandle} from "react";
import { PageContext } from "../utils/context"
import { NextUIProvider } from "@nextui-org/react";

import {
  injectedWallet,
  rainbowWallet,
  metaMaskWallet,
  coinbaseWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';


/* New API that includes Wagmi's createConfig and replaces getDefaultWallets and connectorsForWallets */
const config = getDefaultConfig({
  appName: 'RainbowKit demo',
  projectId: 'b7be756b405935a67c4130e662fa2e69',
  chains: [goerli, mainnet, polygon],
  transports: {
    [goerli.id]: http(),
    [mainnet.id]: http(),
    [polygon.id]: http(),
  },
})


const queryClient = new QueryClient()

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Suggested',
      wallets: [rainbowWallet, walletConnectWallet, metaMaskWallet],
    },
  ],
  {
    appName: 'My RainbowKit App',
    projectId: 'YOUR_PROJECT_ID',
  }
);

// // const { connectors: wagmi_connectors } = getDefaultWallets({
// //   appName: 'flagspace.',
// //   projectId,
// //   chains,
// // });

// const wagmiConfig = createConfig({
//   autoConnect: true,
//   connectors,
//   publicClient,
//   webSocketPublicClient,
// });

function MyApp({ Component, pageProps }: AppProps) {

  return (
   <WagmiProvider config={config}>
     <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <NextUIProvider>
            <PageContext.Provider
              value={{num: 1}}
            >          
              <Component {...pageProps} />
            </PageContext.Provider>
          </NextUIProvider>
        </RainbowKitProvider>
     </QueryClientProvider>
   </WagmiProvider>
  )
}





// /* supabase */
// import { createClient } from "@supabase/supabase-js"
// import { supabaseKey, supabaseUrl } from "../utils/credentials"

// export const supabase = createClient(supabaseUrl, supabaseKey)


// /* Wallet config */
// const projectId = 'b7be756b405935a67c4130e662fa2e69';
// const { chains, publicClient, webSocketPublicClient } = configureChains(
//   [
//     goerli,
//     mainnet,
//     polygon,
//     optimism,
//     arbitrum,
//     base,
//     zora,
//     ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [goerli] : []),
//   ],
//   [publicProvider()]
// );



// function MyApp({ Component, pageProps }: AppProps) {


//   return (
//     <WagmiConfig config={wagmiConfig}>
//       <RainbowKitProvider modalSize="compact" locale='en' chains={chains}>
//         <NextUIProvider>
//           <PageContext.Provider
//             value={{supabase}}
//           >
//             <Component {...pageProps} />
//           </PageContext.Provider>
//         </NextUIProvider>
//       </RainbowKitProvider>
//     </WagmiConfig>
//   );
// }

export default MyApp;
