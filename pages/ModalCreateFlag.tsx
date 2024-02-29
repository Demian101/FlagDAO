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
// import { supabase } from "./_app";

// import getNewestFlags from "./api/getNewestFlag";
// import postToSupabase from "./api/post";

type Inputs = {
    name: string
    address: string
    goal: string
    label: string
    _pledgement: number
    startDate: number
    endDate: number
}
  
export const calculate_pledgement = (_pledgement: number | string): string => {
    if (_pledgement === undefined) {
      return "0.01";
    }
    const pledgementValue = _pledgement === "" ? "0.01" : _pledgement.toString();
    return pledgementValue;
}






const ModalCreateFlag: React.FC = () => {

  const router = useRouter()
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  
  const [flagIdContract, setFlagIdContract] = useState<number>(0);

  const initDate = new Date();
  initDate.setMonth(initDate.getMonth() + 1);

  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(initDate);
  const [unixTimeStart, setUnixTimeStart] = useState<number>();
  const [unixTimeEnd, setUnixTimeEnd] = useState<number>();
  const [isFlaged, setIsFlaged] = useState<number>(0);

  const options = {
    language: 'en',
    usageStatistics: false,
    format: 'YYYY-MM-dd',
    selectableRangeStart: startDate,
    selectableRangeEnd: endDate,
  };

  const handleReset = () => {
    setStartDate(new Date());
    setEndDate(initDate);
  };

  useEffect(()=>{
    setUnixTimeStart(Math.floor(startDate.getTime() / 1000));
    setUnixTimeEnd(Math.floor(endDate.getTime() / 1000));
  }, [startDate, endDate])
  // console.log("startDate.getTime()", unixTimeStart);
  // console.log("endDate.getTime()", unixTimeEnd);

  const { address, isConnected, status } = useAccount()

  // const chains = useChains()
  // const chainId = useChainId()
  // console.log("chains, chainId", chains, chainId)
  
  const [goal, setGoal] = useState<string>("")
  // const [pledgement, setPledgement] = useState<string>("0.01");
  const [_pledgement, set_Pledgement] = useState<number>(0.01)
  const _goal = useDebounce(goal, 20)
  // const _pledgement = useDebounce(pledgement, 200)

  const [name, setName] = useState<string>("")
  const [label, setLabel] = useState<string>("")
  

  const nameRef = useRef<string | undefined>("");
  nameRef.current = name;

  const labelRef = useRef<string | undefined>("");
  labelRef.current = label;

  const goalRef = useRef<string | undefined>("");
  goalRef.current = _goal;

  const pledgementRef = useRef<number | undefined>();
  pledgementRef.current = _pledgement;

  // const { data: idOnchain, isError: isFlagIdErr } = useContractRead({
  //   address: FLAGDAO_CONTRACT_ADDR,
  //   abi: contractABI,
  //   functionName: 'getNewestFlagId',
  // })

  const {data: idOnchain} = useReadContract({
    abi: contractABI,
    address: FLAGDAO_CONTRACT_ADDR,
    functionName: 'getNewestFlagId',
  })

  useEffect(() => {
    if (idOnchain) { 
      setFlagIdContract(Number(idOnchain));
      console.log("flagid(lasted) Onchain----", idOnchain);
    }
  }, [idOnchain]);


  /* forum */ 
  const { register, handleSubmit, watch, formState: { errors },} = useForm<Inputs>()
  useEffect(() => {
    setName(watch("name"));
    setGoal(watch("goal"));
    set_Pledgement(watch("_pledgement"));
    setLabel(watch("label"));
  }, [watch("name"), watch("goal"), watch("_pledgement"), watch("label")]);

  const { 
    data: hash, 
    isPending,
    isSuccess,
    isError,
    writeContract 
  } = useWriteContract() 

  async function submit(e: React.FormEvent<HTMLFormElement>) { 
    e.preventDefault() 
    const formData = new FormData(e.target as HTMLFormElement) 
    const tokenId = formData.get('tokenId') as string
    writeContract({ 
      abi: contractABI,
      address: FLAGDAO_CONTRACT_ADDR,
      functionName: 'createFlag',
      args: [_goal, "", name, label, unixTimeStart, unixTimeEnd], // no need to ** 18
      value: parseEther(calculate_pledgement(_pledgement)), // ethers.utils.parseEther("0.1"),
    })
  } 

  useWatchContractEvent({
    address: FLAGDAO_CONTRACT_ADDR,
    abi: contractABI,
    eventName: 'CreateFlag',
    onLogs(logs) {
      console.log('New logs!', logs)
      // console.log('logs[0]', logs[0] as any);
      setIsFlaged((logs[0] as any).args.flagId)

      onOpenChange();
      router.reload();
      // 关闭 modal, router.reload()
      // router.push("/");
      // router.reload();
    },
  })

  // console.log("infos:, goal, name,\n", goal, name, _pledgement, label) // address
  // console.log("Test upload on Chain \n", arId, _pledgement);
  
  /* 状态判断
  - isPending/isSuccess:   false false <- 未调起
  - isPending/isSuccess:   true false  <- 调起钱包的过程
  - isPending/isSuccess:   false true  <- 签名完成(但还未触发链上 Event) 
  */
  // console.log("isPending/isSuccess:  ", isPending, isSuccess);

  return (
    <div className="flex justify-center items-center">
      <Button
        onPress={onOpen}
        className="mt-16 items-center w-auto text-center my-4 px-8 mx-10 bg-gradient-to-br from-indigo-300 via-blue-400 to-indigo-400 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-200  text-white font-bold py-3 rounded-xl text-xl"
        > Create Flag
      </Button>

      <Modal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange}
        className="m-20 p-12 h-auto w-screen"
        // className="flex items-center justify-center w-full h-full"
        // overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
        >
        <ModalContent>
            {(onClose: any) => (

        isConnected ? (

        <div 
        //   className="relative bg-slate-50 rounded-lg shadow-lg md:w-2/5 py-10 px-20"
          >
          <h3 className="text-2xl mb-4 text-center font-black">
            create your FLAG!
          </h3>

          {/* "handleSubmit" will validate your inputs before invoking "onSubmit" */}
          <form onSubmit={submit}>

            {/* register your input into the hook by invoking the "register" function */}
            <>
              <label className="text-gray-700 font-bold block mt-4">
                * Your flag(Goal) is:
              </label>
              <textarea
                className="border-solid border-gray-300 border py-1 mt-1 px-4 w-full rounded text-gray-700"
                defaultValue=""
                placeholder="🚩 your goal/flag..."
                autoFocus
                rows={3}
                {...register("goal", {
                  required: "Please enter your goal/flag.",
                })}
              />
              {errors?.goal && (
                <div className="mb-3 text-normal text-red-500">
                  {errors?.goal.message}
                </div>
              )}
            </>
            

            <label className="text-gray-700 font-bold block mt-4">
                    Flag&apos;s start/end date:
                  </label>
            <div className="className=border-solid border-gray-300 border mt-1 px-2 w-full rounded text-gray-700">
            <TuiDateRangePicker
              handleChange={(date) => {
                setStartDate(date[0])
                setEndDate(date[1])
              }}
              options={options}
              inputWidth={80}
              containerWidth={200}
              startpickerDate={startDate}
              endpickerDate={endDate}
              />
            </div>

            <div className="mb-6">
              <label className="text-gray-700 font-bold block mt-4">
                * Label:
              </label>
              <input
                className="border-solid border-gray-300 border py-1 mt-1 px-4 w-full rounded text-gray-700"
                defaultValue="Flag"
                placeholder="🤖 your flag type/label..."
                autoFocus
                {...register("label", { required: "Please enter a flag type/label." })}
              />
              {errors?.label && (
                <div className="mb-3 text-normal text-red-500">
                  {errors?.label.message}
                </div>
              )}
            </div>

            <>
              <label className="text-gray-700 font-bold block mt-4">
                * Name:
              </label>
              <input
                className="border-solid border-gray-300 border py-1 mt-1 px-4 w-full rounded text-gray-700"
                defaultValue=""
                placeholder="🤖 your name..."
                autoFocus
                {...register("name", { required: "Please enter a your name." })}
              />
              {errors?.name && (
                <div className="mb-3 text-normal text-red-500">
                  {errors?.name.message}
                </div>
              )}
            </>

            <>
                <label className="text-gray-700 font-bold block mt-4">
                  Pledge amount for the flag:
                </label>
                <div className="jus justify-between grid grid-cols-2 ">
                  <input
                    className="border-solid inline  border-gray-300 py-1 mt-1 pl-4 border w-full rounded text-gray-700"
                    defaultValue={0.001}
                    type="number"
                    min={0.000001}
                    max={9.2}
                    step={0.000001}
                    placeholder="💰 your flag's pledge amount..."
                    autoFocus
                    {...register("_pledgement", {
                      required: "Please enter your pledge amount.",
                    })}
                  />
                  <div className="w-full py-1 mt-1 pl-2"> ETH.</div>
                </div>
                {errors?._pledgement && (
                  <div className="mb-3 text-normal text-red-500">
                    {errors?._pledgement.message}
                  </div>
                )}
 
                { (!isPending && !isSuccess) &&
                    <button
                      className="mt-4 w-full rounded-md bg-black text-center  py-2 text-white border font-semibold text-md"
                      type="submit"
                      name="Submit"
                      disabled={isPending}>
                      Pledge 💰 onChain
                    </button>
                }
                { isPending &&
                    <>
                      <button className="mt-4 w-full rounded-md bg-black text-center  py-2 text-white border font-semibold text-md">
                        Calling wallet, please wait...
                      </button>
                    </>
                }
                {
                  (isSuccess && !isFlaged) && 
                      <div className="text-sm text-slate-500"> 
                        <p>uploading on chain...</p>
                        {/* <p>{name}({address?.slice(0, 3)}...{address?.slice(-2)}) pledged {_pledgement} ETH for her/his flag 🚩(with flagId is {Number(flagIdContract)})</p> */}
                      </div>
                }
                {
                  isError && 
                    <p className="text-sm text-slate-500">
                      User cancel or other errors.
                    </p>
                }
            </>

          </form>
          </div>
        ): <div className="py-6 text-2xl font-semibold">Pls connect your wallet.</div>
        )}
        </ModalContent>
        </Modal>

    </div>
  )
}

export default ModalCreateFlag;