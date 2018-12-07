setwd("C:\\Users\\Dave\\Documents\\GitHub\\tennis_atp")
temp = list.files(pattern="*.csv")
tennis <- do.call(rbind,lapply(temp[1:107],read.csv))
tennis <- as.data.frame(tennis)


tennisWins <- cbind(tennis$winner_rank,tennis$winner_rank - tennis$loser_rank,tennis$winner_age
                    ,tennis$winner_rank_points,tennis$winner_rank_points-tennis$loser_rank_points)
wins <- rep(1,nrow(tennisWins))
losses <- rep(0,nrow(tennisWins))
tennisWins <- cbind(tennis$winner_rank,tennis$winner_rank - tennis$loser_rank,tennis$winner_age
                    ,tennis$winner_rank_points,tennis$winner_rank_points-tennis$loser_rank_points, wins)
tennisLosses <- cbind(tennis$loser_rank,tennis$loser_rank - tennis$winner_rank,tennis$loser_age
                      ,tennis$loser_rank_points,tennis$loser_rank_points-tennis$winner_rank_points, losses)
tennis2<-data.frame(rbind(tennisWins,tennisLosses))
colnames(tennis2) <- c("rank","rankDif", "age","rankpts","rankPtDif","wins")
model<-glm(wins~rank+rankDif+age+rankpts+rankPtDif+rank*rankpts, data = tennis2, family="binomial")

