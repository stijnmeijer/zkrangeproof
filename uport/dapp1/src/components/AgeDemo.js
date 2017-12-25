/*
 * This file is part of the zero-knowledge range proof (ZKRP) uPort demo,
 * which is built on top of the go-ethereum library and the ZKRP by ING Bank N.V.
 *
 * The license for the ZKRP uPort demo is the same as for the go-ethereum library,
 * as stated below. The ZKRP uPort demo is distrubuted WITHOUT ANY WARRANTY.
 *
 * The go-ethereum library is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * The go-ethereum library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with the go-ethereum library. If not, see <http://www.gnu.org/licenses/>.
 *
 */

// Frameworks
import React, { Component } from 'react'
import { uport } from '../utilities/uportSetup'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as AppActions from '../actions/AppActions'

import styled from 'styled-components'

const SplitScreen = styled.section``
const SplitScreenTable = styled.table`
  width: 100%;
`
const FormPasteCommitment = styled.form``

const DemoNote = styled.span`
  font-style: italic;
`

const CredentialsWrap = styled.section``

const CredsButton = styled.button`
  margin-top: 20px;
`

class AgeDemo extends Component {

  constructor (props) {
    super(props)
    this.attestCommitment = this.attestCommitment.bind(this)
    this.attestPrivateVars = this.attestPrivateVars.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
    this.retrieveTTPMessage = this.retrieveTTPMessage.bind(this)

    this.state = {
      commitment: '-1',
      commitmentShort: '?',
      privateVars: '-1',
      privateVarsShort: '?',
      attestCommitment: 'Attest commitment',
      attestPrivateVars: 'Attest private variables',
      retrieveTTPMessage: 'Retrieve TTP message',
      varXInput: '-1'
    }
  }

  /**
   * Watch for changes in the 'year of birth' field, where the secret is being
   * entered, and save its value in the dapp's state for future use.
   */
  handleInputChange(event) {
    this.setState({varXInput: event.target.value})
  }

  /**
   * Make an asynchronous call to the Java HTTP server, invoking the 'testserver'
   * operation. If all is well, we should receive "testserver" as a reply.
   * The timeout is kept at 2 seconds, such that we can quickly find out whether
   * the Java server is reachable.
   */
  testHTTPServer() {
    let xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange = function() {
      if (xhttp.readyState === 4 && xhttp.status === 200) {
        if (xhttp.response !== "testserver") {
          alert("There seems to be a problem with the Java HTTP server -- expected different return value")
        } else {
          console.log("Java HTTP server seems to function normally")
        }
      } else if (xhttp.status >= 300) {
        alert("There seems to be a problem with the Java HTTP server -- HTTP code " + xhttp.status)
      }
    }
    xhttp.ontimeout = function(e) {
      // NOTE: the timeout event is not reliably raised in our tests
      alert("Java HTTP server not responding within 300ms. Is it running? Is Same Origin Policy disabled?")
      console.log(e)
    }
    xhttp.open("GET", "http://localhost:8080/uport-demo/testserver?request=testserver", true)
    xhttp.timeout = 300
    xhttp.send(null)
  }

  /**
   * Send an HTTP request to the Java server, retrieving a TTPMessage (containing
   * a commitment and private variables).
   * NOTE: it may take up to a minute to generate the commitment.
   */
  retrieveTTPMessage() {
    this.testHTTPServer()
    this.setState({retrieveTTPMessage: "⌛"})
    let xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange = (function() {
      // Wait until the reply body is received
      if (xhttp.readyState === 4 && xhttp.status === 200) {
        this.setState({retrieveTTPMessage: "✔️ Done!"})

        let TTPMessage = ""
        try {
          TTPMessage = JSON.parse(xhttp.response).ttppacket
        } catch(err) {
          console.error("Could not extract TTPMessage from JSON")
        }
        let split = TTPMessage.split(",")
        let commitment = split[0] + "," + split[1] + "," + split[2] + "," + split[3]
        let privateVars = split[4] + "," + split[5]

        this.setState({commitment: commitment})
        this.setState({privateVars: privateVars})

        this.setState({commitmentShort: commitment.substring(0,15) + '…'})
        this.setState({privateVarsShort: privateVars.substring(0,15) + '…'})
      }
    }).bind(this)
    xhttp.open("POST", "http://localhost:8080/uport-demo/ttpmessage")
    xhttp.setRequestHeader('Accept', 'application/json')
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
    xhttp.send("X=" + this.state.varXInput)
  }

  /**
   * Attest the commitment: send it to the user's uPort app
   */
  attestCommitment() {
    console.debug("We are going to attest the commitment")
    uport.attestCredentials({
      sub: this.props.uport.address,
      claim: {commitment: this.state.commitment},
      exp: new Date().getTime() + 5 * 365 * 24 * 60 * 60 * 1000,  // 5 years
      uriHandler: (log) => { console.log(log) }
    })

    console.debug("Commitment sent (note that the user can refuse it)")
    this.setState({attestCommitment: '✔️ Sent!'})
    return true
  }

  /**
   * Attest the private variables, containing the private vars X and R.
   */
  attestPrivateVars() {
    console.debug("We are going to attest the private vars")
    uport.attestCredentials({
      sub: this.props.uport.address,
      claim: {privateVars: this.state.privateVars},
      exp: new Date().getTime() + 5 * 365 * 24 * 60 * 60 * 1000,  // 5 years
      uriHandler: (log) => { console.log(log) }
    })

    console.debug("Private variables sent (note that the user can refuse it)")
    this.setState({attestPrivateVars: '✔️ Sent!'})
    return true
  }

  render (props) {
    return (
      <CredentialsWrap>
        <h4>Create attestation carrying the commitment</h4>
        <SplitScreen>
          <SplitScreenTable>
            <tbody>
              <tr>
                <td width="50%"><h6>Generate commitment</h6></td>
                <td width="50%"><h6>Variables</h6></td>
              </tr>
              <tr>
                <td>
                  <FormPasteCommitment>
                    <label>Please enter your year of birth:<br /></label>
                    <input
                      id='X'
                      type='text'
                      onChange={this.handleInputChange}
                      ref={el => this.commitmentInput = el} />
                  </FormPasteCommitment><br />
                  <CredsButton onClick={this.retrieveTTPMessage}>{this.state.retrieveTTPMessage}</CredsButton><br />
                  <DemoNote>This may take up to a minute...<br />Make sure the Java HTTP server is running<br />and that Same Origin Policy is disabled</DemoNote>
                </td>
                <td>
                  <b>Commitment:</b> <span id="commitment">{this.state.commitmentShort}</span><br /><br />
                  <b>Private variables:</b> <span id="privateVars">{this.state.privateVarsShort}</span><br /><br />
                </td>
              </tr>
            </tbody>
          </SplitScreenTable>
        </SplitScreen>
        <CredsButton onClick={this.attestCommitment} disabled={this.state.commitment === '-1'}>{this.state.attestCommitment}</CredsButton>
        <br />
        <CredsButton onClick={this.attestPrivateVars} disabled={this.state.privateVars === '-1'}>{this.state.attestPrivateVars}</CredsButton>
      </CredentialsWrap>
    )
  }
}

const mapStateToProps = (state, props) => {
  return {
    uport: state.App.uport
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    actions: bindActionCreators(AppActions, dispatch)
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(AgeDemo)
