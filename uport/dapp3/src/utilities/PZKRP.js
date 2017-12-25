import { localWeb3 } from './uportSetup'

function PZKRPSetup () {
  let PZKRPABI = localWeb3.eth.contract([{"constant":true,"inputs":[{"name":"lower","type":"uint256"},{"name":"upper","type":"uint256"},{"name":"commitment","type":"string"},{"name":"proof","type":"string"}],"name":"validate","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"}])
  let PZKRPObj = PZKRPABI.at('0x0000000000000000000000000000000000000009')
  return PZKRPObj
}

const PrecompiledRangeProofContract = PZKRPSetup()

export default PrecompiledRangeProofContract
