FROM golang:1.7.4
RUN apt-get update && \
	apt-get install -y libpcap-dev python-requests time file shellcheck && \
	rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
RUN go clean -i net && \
	go install -tags netgo std && \
	go install -race -tags netgo std
RUN go get -tags netgo \
		github.com/fzipp/gocyclo \
		github.com/golang/lint/golint \
		github.com/kisielk/errcheck \
		gopkg.in/mvdan/sh.v1/cmd/shfmt \
		github.com/fatih/hclfmt \
		github.com/mjibson/esc \
		github.com/client9/misspell/cmd/misspell && \
	chmod a+wr --recursive /usr/local/go/pkg && \
	rm -rf /go/pkg/ /go/src/
COPY build.sh /
ENTRYPOINT ["/build.sh"]
