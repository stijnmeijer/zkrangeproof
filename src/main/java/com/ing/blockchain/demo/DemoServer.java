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

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Starts the ZKRP demo server which accepts calls for generating commitments 
 * and range proofs. 
 */
@SpringBootApplication
public class DemoServer {
    
    public static void main(String[] args) {
        SpringApplication.run(DemoServer.class, args);
    }
    
}
