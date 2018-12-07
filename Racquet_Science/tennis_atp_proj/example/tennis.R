load("C:\\Users\\Dave\\Documents\\GitHub\\CSS5590_490_web_mobile\\ICP_6\\MEAN_Stack_App\\example\\tennis.RData")
attach(input[[1]])
predict(model, newdata=df, type="response")
