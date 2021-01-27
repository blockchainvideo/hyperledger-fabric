package main
import (
	
	"encoding/json"
	"fmt"
	"strings"
	"bytes"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	//"github.com/hyperledger/fabric/core/chaincode/lib/cid"
	sc "github.com/hyperledger/fabric/protos/peer"
)

type PartTraceChaincode struct {

}

type exam struct {
	//ObjectType         string `json:"docType"` 
	Class string `json:"class"`
	ExamRegistrationNumber      string `json:"examRegistrationNumber"` 
	ExamName       string `json:"examName"`
	Student              string `json:"student"`
	Location	string	`json:"location"`	
}
func main() {
	err := shim.Start(new(PartTraceChaincode))
	if err != nil {
		fmt.Printf("Error starting part Trace chaincode: %s", err)
	}
}

func (t *PartTraceChaincode) Init(stub shim.ChaincodeStubInterface) sc.Response {
	return shim.Success(nil)
}

func (t *PartTraceChaincode) Invoke(stub shim.ChaincodeStubInterface) sc.Response {
	function, args := stub.GetFunctionAndParameters()
	fmt.Println("invoke is running " + function)
	
	if function == "initPart" { //create a new exam
		return t.initPart(stub, args)
	} else if function == "readPart" { //read a exam
		return t.readPart(stub, args)
	} else if function == "deletePart" { //delete a exam
		return t.deletePart(stub, args)
	} else if function == "queryAllParts" { //query all exam
		return t.queryAllParts(stub)
	} 

	fmt.Println("invoke did not find func: " + function) //error
	return shim.Error("Received unknown function invocation")
}

func (t *PartTraceChaincode) initPart(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	var err error

	// data skeleton 
	//   0       		1      		2			3     		
	// "exam id", "exam name", "student name","location"    
	
	if len(args) != 4 {
		return shim.Error("Incorrect number of arguments. Expecting 4")
	}

	// ==== Input sanitation ====
	fmt.Println("- start init part")
	if len(args[0]) <= 0 {
		return shim.Error("1st argument must be a non-empty string")
	}
	if len(args[1]) <= 0 {
		return shim.Error("2nd argument must be a non-empty string")
	}
	if len(args[2]) <= 0 {
		return shim.Error("3rd argument must be a non-empty string")
	}
	if len(args[3]) <= 0 {
		return shim.Error("5th argument must be a non-empty string")
	}
	

	examRegistrationNumber := args[0]
	examName := strings.ToLower(args[1])	
	student := strings.ToLower(args[2])
	location := strings.ToLower(args[3])

	// ==== Check if part already exists ====
	partAsBytes, err := stub.GetState(examRegistrationNumber)
	if err != nil {
		return shim.Error("Failed to get exam details: " + err.Error())
	} else if partAsBytes != nil {
		return shim.Error("This part already exists: " + examRegistrationNumber)
	}

	// ==== Create part object and marshal to JSON ====
	//objectType := "exam"
	class := "exam"
	//part := &part{ objectType, partRegistrationNumber , partName , inboundDate , outboundDate ,owner}
	//partJSONasBytes, err := json.Marshal(part)
	var user = exam{class, examRegistrationNumber , examName , student,location}
  UserBytes, _ := json.Marshal(user)
	if err != nil {
		return shim.Error(err.Error())
	}

	// === Save part to state ===
	err = stub.PutState(examRegistrationNumber, UserBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	// ==== part saved and indexed. Return success ====
	
	fmt.Println("- end init part. SUCCESSFUL")
	return shim.Success(nil)
}


func (t *PartTraceChaincode) readPart(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	var examRegistrationNumber, jsonResp string
	var err error

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting part number of the part to query")
	}

	examRegistrationNumber =  args[0]
	partbytes, err := stub.GetState(args[0]) //get the part from chaincode state
	if err != nil {
		jsonResp = "{\"Error\":\"Failed to get state for " + examRegistrationNumber + "\"}"
		return shim.Error(jsonResp)
	} 
	//else if valAsbytes == nil {
	//	jsonResp = "{\"Error\":\"Part does not exist: " + examRegistrationNumber + "\"}"
	//	return shim.Error(jsonResp)
	//}

	return shim.Success(partbytes)
}

func (t *PartTraceChaincode) deletePart(stub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}
	examRegistrationNumber := args[0]
	fmt.Println("- start transferPart ", examRegistrationNumber)

	message, err := t.deletePartHelper(stub, examRegistrationNumber)
	if err != nil {
		return shim.Error(message + err.Error())
	} else if message != "" {
		return shim.Error(message)
	}

	fmt.Println("- end deletePart (success)")
	return shim.Success(nil)
}

func (t *PartTraceChaincode) deletePartHelper(stub shim.ChaincodeStubInterface, examRegistrationNumber string) (string, error) {
	
	fmt.Println("deleting part with part registration number: " + examRegistrationNumber )
	partAsBytes, err := stub.GetState(examRegistrationNumber)
	if err != nil {
		return "Failed to get part:", err
	} 
	//else if partAsBytes == nil {
	//	return "part does not exist", err
	//}

	partToTransfer := exam{}
	err = json.Unmarshal(partAsBytes, &partToTransfer) //unmarshal it aka JSON.parse()
	if err != nil {
		return "", err
	}


	err = stub.DelState(examRegistrationNumber) //remove the part from chaincode state
	if err != nil {
		return "This part could not be deleted.", err
	}

	return "", nil
}


func (t *PartTraceChaincode) queryAllParts( stub shim.ChaincodeStubInterface) sc.Response {

	startKey := ""
	endKey := ""

	resultsIterator, err := stub.GetStateByRange(startKey, endKey)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	// buffer is a JSON array containing QueryResults
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		// Add a comma before array members, suppress it for the first array member
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"Key\":")
		buffer.WriteString("\"")
		buffer.WriteString(queryResponse.Key)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Record\":")
		// Record is a JSON object, so we write as-is
		buffer.WriteString(string(queryResponse.Value))
		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	fmt.Printf("- queryAllParts:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}