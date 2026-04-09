#!/bin/bash
case "$1" in
	start|run) echo "Demarrage..." ;;
	stop)      echo "Arret..." ;;
        *) 	   echo "Usage: $0 {start|stop}"; exit 1 ;;
esac
