class ApiResponse{
    constructor(statusCode,data,message="Success"){
        this.statusCode=statusCode
        this.data=data
        this.success=statusCode<400
        this.message=message
    }
}

export {ApiResponse}
// Informational responses (100 – 199)
// Successful responses (200 – 299)
// Redirection messages (300 – 399)
// Client error responses (400 – 499)
// Server error responses (500 – 599)const response = new constructor(200, { name: "John", age: 30 }, "User created successfully");
