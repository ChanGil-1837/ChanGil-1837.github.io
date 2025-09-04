"use client"

import Image from "next/image";
import Animation from "../components/animations"
export default function About() {
  return (
    <section className="text-gray-600 body-font">
      <div className="container mx-auto flex px-5 py-24 md:flex-row flex-col items-center">
        <div className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center">
          <h1 className="title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900">표시할게 없어서 임시로 <br></br>만들어둔 홈 화면</h1>
          <p className="mb-8 leading-relaxed">이렇게 해두면 꽤나 그럴듯 해보입니다. <br></br>나중에 더 정리가 되면 수정해야겠죠?</p>
        </div>
    );
}