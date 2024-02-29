'use client';
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure} from "@nextui-org/react";
import React, { useState, useEffect, useRef } from "react"
import "ethers";
import {parseEther, ethers, Numeric} from "ethers";
import { useForm, SubmitHandler } from "react-hook-form"
import { TuiDateRangePicker } from 'nextjs-tui-date-range-picker';
import { useRouter } from "next/router"

import {
  useWriteContract,
  useWatchContractEvent,
  useAccount,
  useReadContract,
  // useChains,
  // useChainId
} from "wagmi"

import {
  FLAGDAO_CONTRACT_ADDR,
  contractABI,
} from "../utils/constants"
import useDebounce from "../utils/useHooks";
import { divideBy10ToThe18th } from "../utils/utils";
import { BettorsProps } from "./Card";

type CombinedElement = {
  addr: string
  val: bigint
}

const BettorsModal: React.FC<BettorsProps> = (props) => {

  const router = useRouter()
  const {isOpen, onOpen, onOpenChange} = useDisclosure();

  const [bettors, setBettors] = useState<CombinedElement[]>()


  const {data: betAddrs} = useReadContract({
    abi: contractABI,
    address: FLAGDAO_CONTRACT_ADDR,
    functionName: 'getBettors',
    args: [props.id]
  })
  // console.log("betaddrs...", props.id, betAddrs)

  const {data: betShares} = useReadContract({
    abi: contractABI,
    address: FLAGDAO_CONTRACT_ADDR,
    functionName: 'getBettorShares',
    args: [props.id],

  })
  // console.log("betShares...", props.id, betShares)

  const combineLists = (addr: string[], val: bigint[]): CombinedElement[] => {
    return addr.map((key, i) => ({ addr: key, val: val[i] }))
  }
  
  useEffect(() => {
    // Assert that `data` and `value` are string arrays
    if (Array.isArray(betShares) && Array.isArray(betAddrs) && betShares && betAddrs) {
      setBettors(combineLists(betAddrs, betShares))
    }
  }, [betShares, betAddrs])

  return (
    <div>
      <button onClick={onOpen} className="font-sans text-base underline text-slate-400 font-medium">
        bettors
      </button>

      <Modal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange}
        className="m-20 p-12 h-auto w-screen"
        >
        <ModalContent>
          {(onClose: any) => (
             
             <div className="relative overflow-x-auto">
             <table className="w-full text-left text-gray-500">
               <thead className="text-gray-900 uppercase text-sm underline">
                 <tr>
                   <th scope="col" className="px-3 py-2">
                     Address
                   </th>
                   <th scope="col" className="px-3 py-2">
                     Bettor&apos;s Pledgement
                   </th>
                 </tr>
               </thead>
               <tbody>
                 {bettors?.map((item, id) => {
                   return (
                     <tr key={id} className="bg-white text-sm text-gray-700">
                       <th
                         scope="row"
                         className="px-3 py-1 font-medium whitespace-nowrap italic"
                       >
                         {item.addr.slice(0, 5)}......{item.addr.slice(-5)}
                       </th>
                       {/* <td className="px-6 py-4">${item.val.toString()}</td> */}
                       <td className="px-3 py-1">{divideBy10ToThe18th(item.val)}{" ETH"}</td>
                     </tr>
                   )
                 })}
               </tbody>
             </table>
           </div>
          
          )}
        </ModalContent>
        </Modal>

    </div>
  )
}

export default BettorsModal;