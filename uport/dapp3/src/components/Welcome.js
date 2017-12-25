// Frameworks
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as AppActions from '../actions/AppActions'
import styled from 'styled-components'
import { uport } from '../utilities/uportSetup'

const WelcomeWrap = styled.section``
const ConnectUport = styled.button``

class Welcome extends Component {

  constructor (props) {
    super(props)
    this.connectUport = this.connectUport.bind(this)
  }

  connectUport () {
    uport.requestCredentials(
      { requested: ['avatar'],
        notifications: true }
    ).then((credentials) => {
        console.log({credentials})
        this.props.actions.connectUport(credentials)
    })
  }

  render () {
    return (
      <WelcomeWrap>
        <h4>Buy discount tickets</h4>
        <h6>Let us make use of the range proof!</h6>
        <ConnectUport
          onClick={this.connectUport}>
          Connect to the train tickets shop
        </ConnectUport>
      </WelcomeWrap>
    )
  }
}

const mapStateToProps = (state, props) => {
  return {
    uport: state.App.uport
  }
}
const mapDispatchToProps = (dispatch) => {
  return { actions: bindActionCreators(AppActions, dispatch) }
}
export default connect(mapStateToProps, mapDispatchToProps)(Welcome)
