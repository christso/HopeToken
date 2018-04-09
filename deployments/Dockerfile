# ----- 1st stage build -----
FROM golang:1.9-alpine as builder

RUN apk add --no-cache make gcc musl-dev linux-headers git curl
WORKDIR /
RUN curl -o rinkeby.json https://www.rinkeby.io/rinkeby.json
RUN git clone https://github.com/ethereum/go-ethereum.git   

RUN cd /go-ethereum && git checkout 4bb3c89d44e372e6a9ab85a8be0c9345265c763a && make geth

# ----- 2nd stage build -----
FROM alpine:latest

RUN apk add --no-cache ca-certificates    
COPY --from=builder rinkeby.json $HOME/rinkeby.json
COPY --from=builder /go-ethereum/build/bin/geth /usr/local/bin/
RUN geth --datadir=$HOME/.rinkeby init rinkeby.json
VOLUME [ "/root/.rinkeby/geth/lightchaindata" ]
EXPOSE 30303 30304
CMD ["sh", "-c", "geth --networkid=4 --datadir=$HOME/.rinkeby --rpcaddr 0.0.0.0 --syncmode=light --ethstats='Hope:Respect my authoritah!@stats.rinkeby.io' --bootnodes=enode://a24ac7c5484ef4ed0c5eb2d36620ba4e4aa13b8c84684e1b4aab0cebea2ae45cb4d375b77eab56516d34bfbd3c1a833fc51296ff084b770b94fb9028c4d25ccf@52.169.42.101:30303"]
