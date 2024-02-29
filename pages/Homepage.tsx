import React, {
	useContext,
	useEffect,
	useState,
} from "react"

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { contractABI, FLAGDAO_CONTRACT_ADDR,} from "../utils/constants"
import Logo from '../utils/Logo';
import Dropdown from "./Dropdown";
import ModalCreateFlag from './ModalCreateFlag';
import Card from './Card';

// import { PageContext } from "../utils/context"

import {
  useReadContract,
  // useChainId,
  // useChains
} from "wagmi"


type FormData = {
  goal: string
  self_pledged: number
}

export interface CardProps {
  goal: string
  flager: string
  name: string
  id: number
  amt: number
  status: number
  onChain: boolean
  startDate: number
  endDate: number
  label: string
  bettors: Array<string>
  bet_vals: Array<BigInt>
  // other properties...
}

type Props = {
  searchParams: Record<string, string> | null | undefined;
};

const Homepage = (props: Props) => {

  // const { supabase } = useContext(PageContext)
  // const { chains, chain: chainId } = useNetwork()
  // const { address, isConnected, status } = useAccount()
  // const chains = useChains()
  // const chainId = useChainId()
  // console.log("chains, chainId", chains, chainId)


  const [curFromChild, setCurFromChild] = useState()   // Flag 分类
  const [darr, setDarr] = useState<{ [x: string]: any }[] | undefined>()

  const {data: idOnchain} = useReadContract({
    abi: contractABI,
    address: FLAGDAO_CONTRACT_ADDR,
    functionName: 'getNewestFlagId',
  })
  const id: number = Number(idOnchain);
  

  const {data: flags} = useReadContract({
    abi: contractABI,
    address: FLAGDAO_CONTRACT_ADDR,
    functionName: 'getFlagsPagination',
    // args: [0, 9],  0, 9是取最旧的
    args: [id-10 < 0 ? 0 : id-10, id]
  })
  // console.log("flags.data", flags)


  useEffect(() => {
    if (flags) { 
      setDarr(flags as any);
      console.log("flags: ", flags);
    }
  }, [flags])

  /* flag types */ 
  useEffect(() => {
    if (flags && curFromChild) {
      let da: any = (flags as any).filter((item: any) => item.label === curFromChild)
      setDarr(da)
    }
    if (curFromChild === "all") {
      setDarr(flags as any)
    }
  }, [curFromChild])

  function handleValueChange(value: any) {
    setCurFromChild(value)
  }

  return (
    <div className="w-full mx-auto md:w-8/12">
      <header className="h-auto mt-3">
        <div className="flex p-4 items-center justify-center">
          <div className="flex-1">
            <Logo />
          </div>
          <Dropdown onValueChange={handleValueChange} />
          <ConnectButton />
        </div>
        {/* <h1 className="text-3xl font-bold text-center mt-4">FlagDAO</h1> */}
        <ModalCreateFlag />
      </header>

      {darr &&
        [...darr] // 创建原数组的一个副本以避免直接修改原数组
        .sort((a, b) => {
          if (a.id > b.id) return -1;
          if (a.id < b.id) return 1;
          return 0;
        })
        .map((item, index) => (
          <Card
            key={index}
            goal={item.goal}
            flager={item.flager}
            name={item.name}
            id={item.id}
            amt={item.amt}
            status={item.status}
            onChain={item.onChain}
            startDate={item.startDate}
            endDate={item.endDate}
            label={item.label}
            bet_vals={item.bet_vals}
            bettors={item.bettors}
          />
        ))
      }
    </div>
  );
};

export default Homepage;