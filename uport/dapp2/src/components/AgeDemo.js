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
import { uport, govAddress, govPk } from '../utilities/uportSetup'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as AppActions from '../actions/AppActions'

import * as jwt from 'jwt-js'

import styled from 'styled-components'

const SplitScreen = styled.section``
const SplitScreenTable = styled.table`
  width: 100%;
`

const FormEnterRange = styled.form``

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
    this.loadAttestationCommitment = this.loadAttestationCommitment.bind(this)
    this.loadAttestationPrivateVars = this.loadAttestationPrivateVars.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleInputClick = this.handleInputClick.bind(this)
    this.loadOneAttestation = this.loadOneAttestation.bind(this)
    this.retrieveRangeProof = this.retrieveRangeProof.bind(this)
    this.attestRangeproof = this.attestRangeproof.bind(this)

    this.state = {
      commitment: '?',
      privateVars: '?',
      rangeStart: -1,
      rangeEnd: -1,
      rangeStartEntered: false,
      rangeEndEntered: false,
      rangeEntered: false,
      loadAttestationCommitment: 'Load commitment',
      loadAttestationPrivateVars: 'Load private variables',
      retrieveRangeProof: 'Retrieve rangeproof',
      attestRangeproof: 'Attest rangeproof'
    }
  }

  /**
   * Watch for changes in both range fields. Unlock the range proof generation button if
   * both are integers.
   */
  handleInputChange(event) {
    let input = event.target.value

    switch (event.target.id) {
      case "rangeStart":
        if (Number.isInteger(Number(input))) {
          this.setState({rangeStartEntered: true})
          this.setState({rangeStart: Number(input)})
        } else {
          this.setState({rangeStartEntered: false})
        }
        break
      case "rangeEnd":
        if (Number.isInteger(Number(input))) {
          this.setState({rangeEndEntered: true})
          this.setState({rangeEnd: Number(input)})
        } else {
          this.setState({rangeEndEntered: false})
        }
        break
      default:
    }

    this.setState({rangeEntered: (this.state.rangeStartEntered && this.state.rangeEndEntered)})
  }
  // Clear the default value of the input field on click
  handleInputClick(event) {
    console.log(event)
    if (event.target.value === "begin" || event.target.value === "end") {
      event.target.value = ""
    }
  }

  /**
   * While the commitment or private variables are uploaded from the user's uPort
   * app to the dapp, the methods below inform the user of the status by changing
   * the text of the buttons.
   */
  loadAttestationCommitment (e) {
    e.preventDefault()

    this.setState({loadAttestationCommitment: '⌛'})

    // Once loeaded, reply becomes true
    this.loadOneAttestation('commitment', function(reply) {
      this.setState({loadAttestationCommitment: reply === true ? '✔️ Done!' : '❌ Failed!'})
    }.bind(this))
  }
  loadAttestationPrivateVars (e) {
    e.preventDefault()

    this.setState({loadAttestationPrivateVars: '⌛'})

    // Once loeaded, reply becomes true
    this.loadOneAttestation('privateVars', function(reply) {
      this.setState({loadAttestationPrivateVars: reply === true ? '✔️ Done!' : '❌ Failed!'})
    }.bind(this))
  }

  /**
   * Make a call to the Java HTTP server in order to receive a range proof.
   */
  retrieveRangeProof() {
    this.setState({retrieveRangeProof: "⌛"})
    let xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange = (function() {
      // Wait until the reply body is received
      if (xhttp.readyState === 4 && xhttp.status === 200) {
        this.setState({retrieveRangeProof: "✔️ Done!"})

        let RangeProof = ""
        try {
          RangeProof = JSON.parse(xhttp.response).rangeproofPacket
        } catch(err) {
          console.error("Could not extract RangeProof from JSON")
        }

        this.setState({rangeproof: RangeProof})
      }
    }).bind(this)
    xhttp.open("POST", "http://localhost:8080/uport-demo/rangeproof")
    xhttp.setRequestHeader('Accept', 'application/json')
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
    xhttp.send("lower=" + this.state.rangeStart + "&upper=" +
      this.state.rangeEnd + "&commitment=" + this.state.commitment +
      "&privateVars=" + this.state.privateVars)
  }

  /**
   * Upload the commitment or private variables attestation from the user's
   * uPort app to the dapp. Check the attestation's signature where relevant.
   */
  loadOneAttestation(credential, callback) {
    console.debug("Retrieving credential: " + credential)

    uport.requestCredentials({
      verified: [credential]
    }).then((uPortReply) => {
      try {
        let verified = uPortReply.verified[0]
        try {
          let claim = verified.claim[credential];
          // Check that we have the right subject
          if (this.props.uport.address === verified.sub) {
            // Check authority -- is it issued by us?
            if (verified.iss === govAddress) {
              try {
                jwt.decodeToken(verified.jwt)
                // Verify the civil registry's signature on the JWT
                try {
                  if (new jwt.TokenVerifier('ES256k', govPk).verify(verified.jwt)) {
                    switch (credential) {
                      case "commitment":
                        this.setState({commitment: claim})
                        break
                      case "privateVars":
                        this.setState({privateVars: claim})
                        break
                      default:
                    }

                    callback(true)
                    return true
                  } else {
                    console.error('Signature seems incorrect')
                  }
                } catch (err) {
                  console.error('Error when verifying signature')
                  console.error(err)
                }
              } catch (err) {
                console.error('Could not decode JWT')
              }
            } else {
              console.error('Issuer is not an authority')
            }
          } else {
            console.error('Proof belongs to someone else')
          }
        } catch (err) {
          console.error('Could not extract claim for this ageLimit... does it exist?')
        }
      } catch (err) {
        console.error(err);
      }

      callback(false)
    })
  }

  /**
   * Send an attestation to the user, containing the range proof.
   * We include the range in the attestation's name, such that multiple
   * range proofs can exist at the user's phone at the same time.
   */
  attestRangeproof() {
    console.debug("We are going to attest the rangeproof credential for range " + this.state.rangeStart + " - " + this.state.rangeEnd)
    let attestationName = "rangeproof" + this.state.rangeStart + this.state.rangeEnd
    uport.attestCredentials({
      sub: this.props.uport.address,
      claim: {[attestationName]: this.state.rangeproof},
      exp: new Date().getTime() + 5 * 365 * 24 * 60 * 60 * 1000,  // 5 years
      uriHandler: (log) => { console.log(log) }
    })

    console.debug("Attestation sent (note that the user can refuse it)")
    this.setState({attestRangeproof: '✔️ Sent!'})
  }

  render (props) {
    return (
      <CredentialsWrap>
        <h4>Generate a range proof</h4>
        <SplitScreen>
          <SplitScreenTable>
            <tbody>
              <tr>
                <td width="50%"><h6>Upload attestations</h6></td>
                <td width="50%"><h6>Enter range</h6></td>
              </tr>
              <tr>
                <td>
                  <CredsButton onClick={this.loadAttestationCommitment}>{this.state.loadAttestationCommitment}</CredsButton><br /><br />
                  <CredsButton onClick={this.loadAttestationPrivateVars}>{this.state.loadAttestationPrivateVars}</CredsButton><br /><br />
                </td>
                <td>
                  Please specify the year of birth range<br />you want to generate the range proof for:
                  <FormEnterRange>
                    <input
                      id='rangeStart'
                      type='text'
                      onChange={this.handleInputChange}
                      onClick={this.handleInputClick}
                      defaultValue='begin'
                      ref={el => this.rangeStart = el} />
                  </FormEnterRange>
                  &nbsp;to&nbsp;
                  <FormEnterRange>
                    <input
                      id='rangeEnd'
                      type='text'
                      onChange={this.handleInputChange}
                      onClick={this.handleInputClick}
                      defaultValue='end'
                      ref={el => this.rangeEnd = el} />
                  </FormEnterRange>
                  <DemoNote>Use 1900-1999 for the 18+ demo</DemoNote>
                </td>
              </tr>
            </tbody>
          </SplitScreenTable>
        </SplitScreen>
        <CredsButton onClick={this.retrieveRangeProof} disabled={!this.state.rangeEntered}>{this.state.retrieveRangeProof}</CredsButton><br /><br />
        <CredsButton onClick={this.attestRangeproof} disabled={!this.state.rangeEntered}>{this.state.attestRangeproof}</CredsButton>
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
