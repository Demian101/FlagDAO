import { 
  // useContractWrite, 
  // usePrepareContractWrite, 
  useAccount, 
  useWatchContractEvent,
  useWriteContract,
  type BaseError,
} from "wagmi"
import { createClient } from "@supabase/supabase-js"
import { supabaseKey, supabaseUrl } from "../utils/credentials"
import Avatar, { genConfig } from "react-nice-avatar"
import { getTimeDiff, getDateFromUnixtime} from "../utils/utils"
import {parseEther, ethers} from "ethers";

import { useState, useEffect, lazy } from "react"
import { CardProps } from "./Homepage"
import useDebounce from "../utils/useHooks"
import {
  FLAGDAO_CONTRACT_ADDR,
  contractABI,
} from "../utils/constants"

import { calculate_pledgement } from "./ModalCreateFlag"
import Image from 'next/image'
import BettorsModal from "./BettorsModal"
import { ContractOwener } from "../utils/constants"
// const supabase = createClient(supabaseUrl, supabaseKey)

export interface BettorsProps {
  id: number
}

const Card: React.FC<CardProps> = (props) => {
  const [amt, setAmt] = useState<number>(0.01)
  const _amt = useDebounce(amt, 10)
  const [id, setId] = useState<Number>(props.id)
  const _id = useDebounce(id, 100)
  const [isOwner, setIsOwner] = useState<boolean>(false)
  
  const { address } = useAccount()
  useEffect(()=>{
    if (address == ContractOwener) { setIsOwner(true) }
    console.log("isOwner setIsOwner", isOwner)
  },)

  // console.log("created_at", getTimeDifference(props.created_at));

  const changeId = (e: any) => {
    setId(e.target.value)
  }

  const { data, error, writeContract, isPending, isError, isSuccess } = useWriteContract() 
  // console.log("error.", error)
  
  const handleSubmit = async (e: any) => {
    e.preventDefault()
    try {
      console.log("handleSubmit... id: ", _id)
        writeContract({ 
        address: FLAGDAO_CONTRACT_ADDR,
        abi: contractABI, 
        functionName: 'gamblePledge', 
        args: [_id],
        value: parseEther(calculate_pledgement(_amt)), // ethers.utils.parseEther("0.1"),
      })
    } catch (e) {
      console.log('Gamble-Pledge transaction failed:', error)
    }
  }
  // console.log("data, isPending, isError, isSuccess \n", data,isPending, isError, isSuccess )

  useWatchContractEvent({
    address: FLAGDAO_CONTRACT_ADDR,
    abi: contractABI,
    eventName: 'GamblePledge',
    onLogs(logs) {
      console.log('New logs!', logs)
      // logs[0] 里面放的是 _mint 函数 emit 的事件.
      const { args } = logs[1] as any; // 跳过类型检查
      console.log("`GamblePledge` Listen ..", args, )
      // InsertBettorsToSupabase()   // 更新后端 supabase
    },
  })

  const HoverComponent = () => {
    return (
      <div className="relative group">
        <div className="w-64 h-64 bg-blue-500">Hover me</div>
        <div className="absolute right-0 top-0 mt-2 mr-2 w-64 h-64 bg-red-500 opacity-0 group-hover:opacity-80 transition-opacity duration-200">
          Modal content
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-center">
      {/* md:max-w-2xl */}
      <div className="px-12 flex w-full justify-between md:flex-row py-1 m-4 flex-col items-center rounded-2xl bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]">
        <div className="flex flex-row items-center">
          <div className="flex-col items-center p-4">
            <div>
              <Avatar
                style={{ width: "5rem", height: "5rem" }}
                {...genConfig(props?.name || "default")}
              />{" "}
            </div>
            <div className="text-center text-slate-800 font-medium italic">
              @{props?.name}
            </div>
            <div className="text-center text-slate-500 text-xs">
              {props?.flager?.slice(0, 5)}...{props?.flager?.slice(-5)}{" "}
            </div>

          </div>

          {/* Middle: flag Content / Pledgement / labes */}
          <div className="flex flex-col justify-start p-6">
            <p className="mb-2 text-lg font-medium text-neutral-600">
              <Image src="./iconmonstr-quote-1.svg" width={30} height={30} className="inline pr-3 pb-3" alt="" />
              {props?.goal}
              <Image src="./iconmonstr-quote-3.svg" width={30} height={30} className="inline pl-3 pt-3" alt="" />
            </p>
            <div className="flex pb-1 justify-start font-sans text-base text-slate-400 font-medium">
              <span>self gmabled: </span>{" "}
              <span className="pl-2 font-semibold text-orange-400">
                {" "}{(Number(props?.amt) / (10 ** 18)).toString()} {"ETH."}
              </span>
            </div>

            <div className="pb-2">
                <BettorsModal id={props.id} />
            </div>

            <div className="flex justify-start text-xs py-1 text-slate-400 font-medium">
              <span>
                {" "}
                🏁 flag From {getDateFromUnixtime(props?.startDate)} To {getDateFromUnixtime(props?.endDate)}
              </span>
            </div>
            <p className="text-xs  text-slate-400 pb-4">
              <span className="text-slate-600 font-medium italic">@{props?.name}{" "}</span>
              {getTimeDiff(props?.startDate)}
            </p>

            <div className="Labels & # Status">
              <button className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                #{props.label}
              </button>
              <button
                className={`inline-block rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2 
                ${
                  props?.status === 0
                    ? "bg-yellow-500"
                    : props?.status === 1
                    ? "bg-green-600"
                    : props?.status === 2
                    ? "bg-red-500"
                    : ""
                }`}
              >
                {props?.status === 0 ? "WIP" : props?.status === 1 ? "Success!" : "Rug!"}

              </button>
            </div>
          </div>
        </div>

        {/* Button & input of Pledge */}
        <div>
          {" "}
          {props?.status === 0 && (
            <form onSubmit={(e) => handleSubmit(e)}>


              {error && ( 
                <div>Error: {(error as BaseError).shortMessage || error.message}</div> 
              )} 

              {isPending ? (
                <span className="font-sans font-semibold text-slate-800 text-base  text-center  rounded-lg ">
                  Pending..
                </span>
              ) : (
                <>
                  {/* <label
                    htmlFor="input-group-1"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Your Email
                  </label> */}
                  <div className="relative mb-2 w-32">
                    <div className="absolute inset-y-0 left-1 flex items-center pl-1 pointer-events-none">
                      {/* <BsCurrencyBitcoin className="w-5 h-5 text-gray-500" />*/}
                      {/* <FontAwesomeIcon icon="fa-brands fa-ethereum" />*/}
                      <svg xmlns="http://www.w3.org/2000/svg" height="16" width="10" viewBox="0 0 320 512"><path d="M311.9 260.8L160 353.6 8 260.8 160 0l151.9 260.8zM160 383.4L8 290.6 160 512l152-221.4-152 92.8z"/></svg>
                    </div>
                    <input
                      className="w-full pl-6 bg-gray-50 border border-gray-300 text-gray-500 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-1.5"
                      onChange={(e: any) => setAmt(e.target.value)}
                      placeholder="bet for it!"
                      value={_amt}
                      min={0.00001}
                      max={9.2}
                      step={0.00001}  
                      type="number"
                      id="input-group-1"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full border-x-0.5 font-sans font-semibold text-slate-100 text-base px-2 py-1 text-center mr-2 mb-2 bg-gradient-to-br from-indigo-300 via-blue-400 to-indigo-400 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-200 rounded-lg "
                  >
                    Pledge
                  </button>
                </>
              )}
            </form>
          )}
          <form>
            {props?.status === 1 && (
              <button
                type="submit"
                className="border-x-0.5 font-sans font-semibold text-slate-100 text-base px-2 py-1 text-center mr-2 mb-2 bg-gradient-to-r from-red-200 via-red-300 to-yellow-200 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-red-100 rounded-lg "
              >
                Collect Winnings
              </button>
            )}
            {props?.status === 2 && (
              <button
                type="submit"
                className="border-x-0.5 font-sans font-semibold text-slate-100 text-base px-2 py-1 text-center mr-2 mb-2 bg-gradient-to-r from-red-200 via-red-300 to-yellow-200 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-red-100 rounded-lg "
              >
                Claim the Bet!
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
export default Card;