// Copyright 2017 ING Bank N.V.
// This file is part of the go-ethereum library.
//
// The go-ethereum library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// The go-ethereum library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with the go-ethereum library. If not, see <http://www.gnu.org/licenses/>.

package zkrangeproof

import (
  "math/big"
  "fmt"
  "crypto/sha256"
  "github.com/ethereum/go-ethereum/byteconversion"
)

// Security parameters
var t = 128
var l = 40

func ValidateRangeProof(lowerLimit *big.Int,
						upperLimit *big.Int,
						commitment[] *big.Int,
						proof [] *big.Int) bool {

	if len(commitment) < 4 || len(proof) < 18 {
        fmt.Println("ZKRP validation failed, invalid length for commitment or proof")
		return false
	}

	T := 2 * (t + l + 1) + Sub(upperLimit, lowerLimit).BitLen()
	lowerLimitPrime := ShiftLeft(lowerLimit, T)
	upperLimitPrime := ShiftLeft(upperLimit, T)
	commitmentPrime := commitment[:]
	commitmentPrime[0] = ModPow(commitment[0], ShiftLeft(new(big.Int).SetInt64(1), T), commitment[1])

    return ValidateProofWithTolerance(lowerLimitPrime, upperLimitPrime, commitmentPrime, proof)
}

func ValidateProofWithTolerance(lowerLimit *big.Int,
                                upperLimit *big.Int,
                                commitment[] *big.Int,
                                proof [] *big.Int) bool {

	if len(commitment) < 4 || len(proof) < 18 {
        fmt.Println("ZKRP validation failed, invalid length for commitment or proof")
		return false
	}

    c := commitment[0]
    N := commitment[1]
    g := commitment[2]
    h := commitment[3]

    if (N.Cmp(big.NewInt(0)) <= 0) {
        fmt.Println("Invalid group")
        return false
    }

    cLeftSquare := proof[0]
    cRightSquare := proof[1]
    squareProofLeft := proof[2:7]
    squareProofRight := proof[7:12]
    cftProofLeft := proof[12:15]
    cftProofRight := proof[15:18]

    // Step 2
    cLeft := DivMod(c, ModPow(g, lowerLimit, N), N)
    cRight := DivMod(ModPow(g, upperLimit, N), c, N)

    // Step 6
    cLeftRemaining := DivMod(cLeft, cLeftSquare, N)
    cRightRemaining := DivMod(cRight, cRightSquare, N)

    // Step 7
    if (!HPAKESquareValidateZeroKnowledgeProof (N, g, h, cLeftSquare, squareProofLeft)) {
        fmt.Println("ZKRP validation failed at left square proof")
        return false
    }
    if (!HPAKESquareValidateZeroKnowledgeProof (N, g, h, cRightSquare, squareProofRight)) {
        fmt.Println("ZKRP validation failed at right square proof")
        return false
    }

    // Step 8
    CFT_maxCommitment := FloorSquareRoot(ShiftLeft(Sub(upperLimit, lowerLimit), 2));
    if (!CFTValidateZeroKnowledgeProof (CFT_maxCommitment, N, g, h, cLeftRemaining, cftProofLeft)) {
        fmt.Println("ZKRP validation failed at left CFT proof")
        return false
    }
    if (!CFTValidateZeroKnowledgeProof (CFT_maxCommitment, N, g, h, cRightRemaining, cftProofRight)) {
        fmt.Println("ZKRP validation failed at right CFT proof")
        return false
    }

    fmt.Println("ZKRP validation succeeded")
    return true
}

func HPAKESquareValidateZeroKnowledgeProof (
             N *big.Int,
             g *big.Int,
             h *big.Int,
             E *big.Int,
             sqProof[] *big.Int) bool {

	F := sqProof[0]
	ecProof := sqProof[1:]

	return HPAKEEqualityConstraintValidateZeroKnowledgeProof(N, g, F, h, h, F, E, ecProof)
}


func HPAKEEqualityConstraintValidateZeroKnowledgeProof (
             N *big.Int,
             g1 *big.Int,
             g2 *big.Int,
             h1 *big.Int,
             h2 *big.Int,
             E *big.Int,
             F *big.Int,
             ecProof[] *big.Int) bool {

	C := ecProof[0]
	D := ecProof[1]
	D1 := ecProof[2]
	D2 := ecProof[3]

	W1 := Mod(Multiply(Multiply(ModPow(g1, D, N), ModPow(h1, D1, N)), ModPow(E, Multiply(C, new(big.Int).SetInt64(-1)), N)), N)
	W2 := Mod(Multiply(Multiply(ModPow(g2, D, N), ModPow(h2, D2, N)), ModPow(F, Multiply(C, new(big.Int).SetInt64(-1)), N)), N)

  hashW, errW := CalculateHash(W1, W2)
  if errW != nil {
    fmt.Println("Failure: empty ByteArray in CalculateHash [W1, W2]")
    return false
  }

	return C.Cmp(hashW) == 0
}

func CFTValidateZeroKnowledgeProof(
            b *big.Int,
            N *big.Int,
            g *big.Int,
            h *big.Int,
            E *big.Int,
            cftProof[] *big.Int) bool {

	C := cftProof[0]
	c := Mod(C, new(big.Int).SetBit(big.NewInt(0), t, 1))
	D1 := cftProof[1]
	D2 := cftProof[2]

	W := Mod(Multiply(Multiply(ModPow(g, D1, N), ModPow(h, D2, N)), ModPow(E, Multiply(c, new(big.Int).SetInt64(-1)), N)), N)

  hashW, errW := CalculateHash(W, nil)
  if errW != nil {
    fmt.Println("Failure: empty ByteArray in CalculateHash [W]")
    return false
  }

   	return C.Cmp(hashW) == 0 &&
   	    D1.Cmp(Multiply(b, c)) >= 0 &&
   	    D1.Cmp(Multiply(b, new(big.Int).SetBit(big.NewInt(0), t + l, 1))) <= 0
}

func CalculateHash(b1 *big.Int, b2 *big.Int) (*big.Int, error) {

	digest := sha256.New()
	digest.Write(byteconversion.ToByteArray(b1))
	if (b2 != nil) {
		digest.Write(byteconversion.ToByteArray(b2))
	}
	output := digest.Sum(nil)
	tmp := output[0: len(output)]
	return byteconversion.FromByteArray(tmp)
}

/**
 * Returns base**exponent mod |modulo| also works for negative exponent (contrary to big.Int.Exp)
 */						
func ModPow(base *big.Int, exponent *big.Int, modulo *big.Int) *big.Int {

	var returnValue *big.Int

	if exponent.Cmp(big.NewInt(0)) >=0 {
		returnValue = new(big.Int).Exp(base, exponent, modulo)
	} else {
		// Exp doesn't support negative exponent so instead:
		// use positive exponent than take inverse (modulo)..
		returnValue =  ModInverse(new(big.Int).Exp(base, new(big.Int).Abs(exponent), modulo), modulo)
	}
	return returnValue
}

func Add(x *big.Int, y *big.Int) * big.Int {
	return new(big.Int).Add(x, y)
}

func Sub(x *big.Int, y *big.Int) * big.Int {
	return new(big.Int).Sub(x, y)
}

func Div(x *big.Int, y *big.Int) * big.Int {
	return new(big.Int).Div(x, y)
}

func Mod(base *big.Int, modulo *big.Int) * big.Int {
	return new(big.Int).Mod(base, modulo)
}

func Multiply(factor1 *big.Int, factor2 *big.Int) *big.Int {
	return new(big.Int).Mul(factor1, factor2)
}

func ModInverse(base *big.Int, modulo *big.Int) *big.Int {
	return new(big.Int).ModInverse(base, modulo)
}

func DivMod(a *big.Int, b *big.Int, N *big.Int) *big.Int {
    return Mod(Multiply(a, ModInverse(b, N)), N)
}

func ShiftLeft(a *big.Int, b int) *big.Int {
    return Multiply(a, new (big.Int).SetBit(big.NewInt(0), b, 1))
}

func FloorSquareRoot(input *big.Int) *big.Int {
    if (input.Cmp(big.NewInt(0)) < 0) {
        return big.NewInt(0)
    }

    prev2 := big.NewInt(0)
    prev := big.NewInt(0)
    approx := new (big.Int).SetBit(big.NewInt(0), input.BitLen() / 2, 1)

    // To improve approximation of a = sqrt(i), set it to (i / a + a) / 2
    // Stop when approx does not change or starts alternating
    for (approx.Cmp(prev) != 0 && approx.Cmp(prev2) != 0) {
        prev2 = prev
        prev = approx
        approx = Div(Add(Div(input, approx), approx), big.NewInt(2))
    }

    if Multiply(approx, approx).Cmp(input) >= 1 {
        approx = Sub(approx, big.NewInt(1))
    }
    return approx;
}