// //////////////////////////////////////////////
// Connect uPort
// //////////////////////////////////////////////

export const connectUport = (data) => {
  return {
    type: 'CONNECT_UPORT',
    data
  }
}

// //////////////////////////////////////////////
// Welcome page finished
// //////////////////////////////////////////////

export const welcomeComplete = (data) => {
  return {
    type: 'WELCOME_COMPLETE'
  }
}

// //////////////////////////////////////////////
// Validate Proof
// //////////////////////////////////////////////

export const validateProofREQUEST = () => {
  return {
    type: 'VALIDATE_PROOF_REQUEST'
  }
}
export const validateProofSUCCESS = (data) => {
  return {
    type: 'VALIDATE_PROOF_SUCCESS',
    data
  }
}
export const validateProofERROR = (data) => {
  return {
    type: 'VALIDATE_PROOF_ERROR',
    data
  }
}
