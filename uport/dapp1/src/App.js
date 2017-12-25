// Frameworks
import React, { Component } from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as AppActions from './actions/AppActions'

import styled from 'styled-components'

// Components
import AppNavbar from './components/AppNavbar'
import Welcome from './components/Welcome'
import AgeDemo from './components/AgeDemo'

const AppWrap = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
`

const AppBody = styled.div`
  flex: 1 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  max-width: 100%;
  padding: 20px;
  overflow: scroll;
`

class App extends Component {
  render () {
    return (
      <AppWrap>
        <AppNavbar />
        <AppBody>
          {
            !this.props.uport &&
            !this.props.ageDemo
              ? <Welcome />
              : null
          }
          {
            this.props.ageDemo
              ? <AgeDemo />
              : null
          }
        </AppBody>
      </AppWrap>
    )
  }
}

const mapStateToProps = (state, props) => {
  return {
    uport: state.App.uport,
    ageDemo: state.App.ageDemo
  }
}
const mapDispatchToProps = (dispatch) => {
  return { actions: bindActionCreators(AppActions, dispatch) }
}
export default connect(mapStateToProps, mapDispatchToProps)(App)
