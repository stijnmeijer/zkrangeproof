let initialState = {

}

export default(state = initialState, payload) => {
  switch (payload.type) {
    case 'CONNECT_UPORT':
      return {
        ...state,
        uport: payload.data,
        ageDemo: true
      }

    case 'WELCOME_COMPLETE':
      return {
        ...state,
        connectYourUport: true
      }

    case 'VALIDATE_PROOF_REQUEST':
      return {
        ...state,
        validatingProof: true
      }
    case 'VALIDATE_PROOF_SUCCESS':
      return {
        ...state,
        validatingProof: false,
        proofOkay: payload.data
      }
    case 'VALIDATE_PROOF_ERROR':
      return {
        ...state,
        validatingProof: false,
        error: payload.data
      }

    default:
      return state
  }
}
