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

    default:
      return state
  }
}
