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

import validateProof from '../utilities/validateProof'

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
    this.loadAttestationRangeproof = this.loadAttestationRangeproof.bind(this)
    this.loadOneAttestation = this.loadOneAttestation.bind(this)
    this.checkProof = this.checkProof.bind(this)
    this.checkProof18Plus = this.checkProof18Plus.bind(this)
    this.checkProof65Plus = this.checkProof65Plus.bind(this)
    this.checkProof = this.checkProof.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleInputClick = this.handleInputClick.bind(this)

    this.state = {
      commitment: -1,
      rangeproof: -1,
      rangeStart: -1,
      rangeEnd: -1,
      rangeStartEntered: false,
      rangeEndEntered: false,
      rangeEntered: false,
      loadAttestationCommitment: 'Load commitment',
      loadAttestationRangeproof: 'Load range proof',
      checkProof18Plus: 'Check proof (18+)',
      checkProof65Plus: 'Check proof (65+)',
      proofError: ''
    }
  }

  /**
   * Watch for changes in both range fields. Unlock the button for
   * uploading the range proof attestation only if both are integers.
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
   * While the commitment or range proof is uploaded from the user's uPort
   * app to the dapp, the methods below inform the user of the status by changing
   * the text of the buttons.
   */
  loadAttestationCommitment (e) {
    e.preventDefault()

    this.setState({loadAttestationCommitment: '⌛'})

    this.loadOneAttestation('commitment', function(reply) {
      this.setState({loadAttestationCommitment: reply === true ? '✔️ Done!' : '❌ Failed!'})
    }.bind(this))
  }
  loadAttestationRangeproof (e) {
    e.preventDefault()

    this.setState({loadAttestationRangeproof: '⌛'})

    this.loadOneAttestation('rangeproof', function(reply) {
      this.setState({loadAttestationRangeproof: reply === true ? '✔️ Done!' : '❌ Failed!'})
    }.bind(this))
  }

  /**
   * Check the proof for a 18+ or a 65+ range, and inform the user by updating
   * the corresponding button accordingly.
   */
  checkProof18Plus (e) {
    e.preventDefault()

    let lower = 1900
    let upper = 1999

    this.setState({checkProof18Plus: '⌛'})
    this.checkProof(lower, upper)
  }
  checkProof65Plus (e) {
    e.preventDefault()

    let lower = 1900
    let upper = 1952

    this.setState({checkProof65Plus: '⌛'})
    this.checkProof(lower, upper)
  }

  /**
   * Upload the commitment or range proof attestation from the user's uPort
   * app to the dapp. For the commitment, the signature on the attestation is
   * being checked  as well.
   */
  loadOneAttestation(credential, callback) {
    console.log("Retrieving credential " + credential + "...")
    if (credential === "commitment") {
      // We need to verify the authenticity of the commitment
      uport.requestCredentials({
        verified: [credential]
      }).then((uPortReply) => {
        try {
          let verified = uPortReply.verified[0]
          try {
            // Check that we have the right subject
            if (this.props.uport.address === verified.sub) {
              // Check authority of the commitment's issuer
              if (verified.iss === govAddress || credential !== "commitment") {
                try {
                  // Verify the issuers signature on the JWT
                  try {
                    if (new jwt.TokenVerifier('ES256k', govPk).verify(verified.jwt)) {
                      this.setState({commitment: verified.claim[credential]})
                      callback(true)
                      return true // prevent the callback(false) from being executed
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
                console.error('The commitment was provided by an issuer that is not an authority')
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
    } else if (credential === "rangeproof") {
      // We do not need to verify the signature of the rangeproof attestation.
      let attestationName = "rangeproof" + this.state.rangeStart + this.state.rangeEnd
      uport.requestCredentials({
        requested: [attestationName]
      }).then((uPortReply) => {
        this.setState({[credential]: uPortReply[attestationName]})
        if (uPortReply[attestationName] !== undefined) {
          callback(true)
        } else {
          callback(false)
        }
      })
    }

  }

  /**
   * Here we will call the precompiled Solidiy contract in order to validate
   * the range proof.
   * The variables 'lower' and 'upper' are the range proof's year of birth bounds.
   * Update the corresponding buttons accordingly.
   */
  checkProof(lower, upper) {
    if (this.state.commitment === -1) {
      this.setState({proofError: "Please check (once) that commitment is present"})
    }
    if (this.state.rangeproof === -1) {
      this.setState({proofError: "Please check (once) that the correct range proof is present"})
    }
    const actions = this.props.actions

    validateProof(lower, upper, this.state.commitment, this.state.rangeproof, actions, function(reply) {
      if (this.state.checkProof18Plus === '⌛') {
        this.setState({checkProof18Plus: reply === true ? '✔️ Okay!' : '❌ Failed!'})
      }
      if (this.state.checkProof65Plus === '⌛') {
        this.setState({checkProof65Plus: reply === true ? '✔️ Okay!' : '❌ Failed!'})
      }
    }.bind(this))
  }

  render (props) {
    return (
      <CredentialsWrap>
        <h4>Buying discount train tickets</h4>
        <SplitScreen>
          <SplitScreenTable>
            <tbody>
              <tr>
                <td width="50%"><h6>Load attestations</h6></td>
                <td width="50%"><h6>Buy tickets</h6></td>
              </tr>
              <tr>
                <td>
                  <CredsButton onClick={this.loadAttestationCommitment}>{this.state.loadAttestationCommitment}</CredsButton><br /><br />
                  Please specify the age range you want to prove:
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
                  <DemoNote>Use 1900-1999 for the 18+ demo</DemoNote><br />
                  <CredsButton onClick={this.loadAttestationRangeproof} disabled={!this.state.rangeEntered}>{this.state.loadAttestationRangeproof}</CredsButton>
                </td>
                <td>
                  Get 18+ discount: <br />
                  <CredsButton onClick={this.checkProof18Plus}>{this.state.checkProof18Plus}</CredsButton><br /><br />
                  Get 65+ discount: <br />
                  <CredsButton onClick={this.checkProof65Plus}>{this.state.checkProof65Plus}</CredsButton><br /><br />
                  <span>{this.state.proofError}</span><br />
                  <DemoNote>Make sure that the modified Geth client is running<br />with parameter --rpc</DemoNote>
                </td>
              </tr>
            </tbody>
          </SplitScreenTable>
        </SplitScreen>
      </CredentialsWrap>
    )
  }
}

const mapStateToProps = (state, props) => {
  return {
    uport: state.App.uport,
    validatingProof: state.App.validatingProof,
    proofOkay: state.App.proofOkay
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    actions: bindActionCreators(AppActions, dispatch)
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(AgeDemo)
