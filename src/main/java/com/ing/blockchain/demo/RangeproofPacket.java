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

package com.ing.blockchain.demo;

import com.ing.blockchain.zk.RangeProof;
import com.ing.blockchain.zk.dto.BoudotRangeProof;
import com.ing.blockchain.zk.dto.ClosedRange;
import com.ing.blockchain.zk.dto.Commitment;
import com.ing.blockchain.zk.dto.SecretOrderGroup;
import com.ing.blockchain.zk.dto.TTPMessage;
import java.math.BigInteger;

/**
 * This class generates a range proof, such that it can be sent in return to 
 * an HTTP request. 
 */
public final class RangeproofPacket {
    
    // The generated range proof, converted to a String, separated by commas.
    private final String rangeProof;
    
    /**
     * Generate a new range proof
     * @param lower the lower bound for the range proof
     * @param upper the upper bound for the range proof
     * @param ttpMessage the TTPMessage, containing commitment and private vars.
     */
    public RangeproofPacket(String lower, String upper, String ttpMessage) {
        TTPMessage parsedTTPMessage = parseTTPMessage(ttpMessage);
        ClosedRange range = ClosedRange.of(lower, upper);

        if (!range.contains(parsedTTPMessage.getX())) {
            this.rangeProof = "RangeError";
            throw new IllegalArgumentException("Provided range does not contain the committed value");
        }

        BoudotRangeProof bdRangeProof = RangeProof.calculateRangeProof(parsedTTPMessage, range);
        RangeProof.validateRangeProof(bdRangeProof, parsedTTPMessage.getCommitment(), range);

        this.rangeProof = this.exportProof(bdRangeProof);
    }
    
    /**
     * Get the generated range proof.
     * @return range proof, separated by commas
     */
    public String getRangeproofPacket() {
        return rangeProof;
    }
   
    /**
     * Parse the received TTPMessage, which is an input to the range proof 
     * generation.
     * @param ttpMessage commitment and private variables, as a String, 
     * separated by commas
     * @return the input converted into a TTPMessage data structure
     */
    private TTPMessage parseTTPMessage(String ttpMessage) {
        String[] fields = ttpMessage.split(",");
        SecretOrderGroup group = new SecretOrderGroup(
                new BigInteger(fields[1]),
                new BigInteger(fields[2]),
                new BigInteger(fields[3]));
        Commitment c = new Commitment(group, new BigInteger(fields[0]));
        return new TTPMessage(c, new BigInteger(fields[4]), new BigInteger(fields[5]));
    }
    
    /**
     * Export the range proof as a String
     * @param rangeProof the range proof as a BoudotRangeProof data structure
     * @return the range proof as a String, separated by commas
     */
    public String exportProof(BoudotRangeProof rangeProof) {
        StringBuilder proofString = new StringBuilder();

        proofString.append(rangeProof.getCLeftSquare().toString());  // proof[0]
        proofString.append(',');
        proofString.append(rangeProof.getCRightSquare().toString()); // proof[1]
        proofString.append(',');
        proofString.append(rangeProof.getSqrProofLeft().getF().toString()); // proof[2]
        proofString.append(',');
        proofString.append(rangeProof.getSqrProofLeft().getECProof().getC().toString()); // proof[3]
        proofString.append(',');
        proofString.append(rangeProof.getSqrProofLeft().getECProof().getD().toString()); // proof[4]
        proofString.append(',');
        proofString.append(rangeProof.getSqrProofLeft().getECProof().getD1().toString()); // proof[5]
        proofString.append(',');
        proofString.append(rangeProof.getSqrProofLeft().getECProof().getD2().toString()); // proof[6]
        proofString.append(',');
        proofString.append(rangeProof.getSqrProofRight().getF().toString()); // proof[7]
        proofString.append(',');
        proofString.append(rangeProof.getSqrProofRight().getECProof().getC().toString()); // proof[8]
        proofString.append(',');
        proofString.append(rangeProof.getSqrProofRight().getECProof().getD().toString()); // proof[9]
        proofString.append(',');
        proofString.append(rangeProof.getSqrProofRight().getECProof().getD1().toString()); // proof[10]
        proofString.append(',');
        proofString.append(rangeProof.getSqrProofRight().getECProof().getD2().toString()); // proof[11]
        proofString.append(',');
        proofString.append(rangeProof.getCftProofLeft().getC().toString()); // proof[12]
        proofString.append(',');
        proofString.append(rangeProof.getCftProofLeft().getD1().toString()); // proof[13]
        proofString.append(',');
        proofString.append(rangeProof.getCftProofLeft().getD2().toString()); // proof[14]
        proofString.append(',');
        proofString.append(rangeProof.getCftProofRight().getC().toString()); // proof[15]
        proofString.append(',');
        proofString.append(rangeProof.getCftProofRight().getD1().toString()); // proof[16]
        proofString.append(',');
        proofString.append(rangeProof.getCftProofRight().getD2().toString()); // proof[17]

        return proofString.toString();
    }
}
