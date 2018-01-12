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

import com.ing.blockchain.zk.TTPGenerator;
import com.ing.blockchain.zk.components.SecretOrderGroupGenerator;
import com.ing.blockchain.zk.dto.SecretOrderGroup;
import com.ing.blockchain.zk.dto.TTPMessage;
import java.math.BigInteger;

/**
 * This class prepares an TTPMessage (commitment + private variables), to be sent
 * in reply to an HTTP reuest. 
 */
public final class TTPPacket {
    
    // The TTPMessage, converted to a String, separated by commas.
    private final String ttpMessage;
    
    /**
     * Generate a new TTPMessage given a secret.
     * NOTE that this can take a while (up to a minute).
     * @param X the secret
     */
    public TTPPacket(String X) {
        int n = Integer.parseInt(X);
        BigInteger x = new BigInteger("" + n);
        SecretOrderGroup group = new SecretOrderGroupGenerator(512).generate();
        TTPMessage message = TTPGenerator.generateTTPMessage(x, group);
        this.ttpMessage = message.getCommitment().getCommitmentValue() + "," + 
                            message.getCommitment().getGroup().getN() + "," + 
                            message.getCommitment().getGroup().getG() + "," + 
                            message.getCommitment().getGroup().getH() + "," + 
                            message.getX() + "," + message.getY();
    }
    
    /**
     * Get the generated TTPMessage
     * @return the TTPMessage, containing a commitment and private variables
     */
    public String getTTPPacket() {
        System.out.println("TTP Message generated, now sending. Make sure your browser's Same Origin Policy is disabled.");
        return ttpMessage;
    }

}
