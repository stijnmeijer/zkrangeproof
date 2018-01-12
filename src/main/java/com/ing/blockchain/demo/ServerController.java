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

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller of the ZKRP demo server. Handles three different calls, which are 
 * indicated by the @RequestMapping annotations below.
 */
@RestController
public class ServerController {
    
    /**
     * Accept a 'testserver' HTTP request which helps the requestee to determine 
     * whether the demo server is easily reachable, by simply mirorring the 
     * request parameter. 
     * @param request the request to be mirrored
     * @return request
     */
    @RequestMapping("/uport-demo/testserver")
    public String testString (@RequestParam(value="request") String request) {
        return request;
    }
    
    /**
     * Accepts the TTPMessage HTTP request. The issuer will perform this request 
     * in order to retrieve the commitment (4 BigIntegers) and the 'private 
     * variables' (2 BigIntegers), which together form the TTPMessage. The 
     * BigIntegers are converted into strings and concatenated with commas 
     * inbetween.
     * @param X the secret on which to base the TTPMessage on. 
     * @return the TTPMessage, concatenated with commas inbetween. 
     */
    @RequestMapping("/uport-demo/ttpmessage")
    public TTPPacket ttpPacket(@RequestParam(value="X") String X) {
        System.out.println("Going to generate and send TTPmessage with secret: " + X + ". This can take up to a minute...");
        return new TTPPacket(X);
    }
    
    /**
     * Accepts the Rangeproof HTTP request. This request will be performed by 
     * the intermediary. 
     * @param lower the lower limit for the rangeproof
     * @param upper the upper limit for the rangeproof
     * @param commitment the commitment, seperated by commas inbetween
     * @param privateVars the private variables, separated by commas inbetween
     * @return the range proof, separated by commas inbetween
     */
    @RequestMapping("/uport-demo/rangeproof")
    public RangeproofPacket rangeproofPacket(@RequestParam(value="lower") String lower, @RequestParam(value="upper") String upper, @RequestParam(value="commitment") String commitment, @RequestParam(value="privateVars") String privateVars) {
        System.out.println("Going to generate and send rangeproof with lower: " + lower + ", upper: " + upper);
        return new RangeproofPacket(lower, upper, commitment + "," + privateVars);
    }
    
}
