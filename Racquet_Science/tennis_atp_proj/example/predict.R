setwd("C:\\Users\\Dave\\Documents\\GitHub\\tennis_atp")
if(length(list.files(pattern="model.RData"))>0){
  load("~/GitHub/tennis_atp/model.RData")
}else{
  source("~/GitHub/tennis_atp/tennisR.R")
}
attach(input[[1]])


predict(model,newdata = df,type="response")