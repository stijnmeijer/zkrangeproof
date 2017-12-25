import PrecompiledRangeProofContract from '../utilities/PZKRP'

async function validateProof (lower, upper, commitment, proof, actions, callback) {
  actions.validateProofREQUEST()

  PrecompiledRangeProofContract.validate
    .call(lower, upper, commitment, proof, (error, reply) => {
      console.log('Validating proof with settings:')
      console.log('Lower bound: ' + lower)
      console.log('Upper bound: ' + upper)
      console.log('Commitment: ' + commitment)
      console.log('Range proof: ' + proof)

      if (error) {
        actions.validateProofERROR(error)
        throw error
      }

      console.log('Contract reply: ' + reply)
      actions.validateProofSUCCESS(reply)
      callback(reply)
      return reply
    })
}

export default validateProof
