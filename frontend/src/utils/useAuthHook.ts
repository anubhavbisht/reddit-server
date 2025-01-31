import { useEffect } from "react";
import { useMeQuery } from "../graphql/generated/graphql";
import { useRouter } from "next/router";

export const isUserAuthorized = () => {
    const [{ data, fetching }] = useMeQuery()
    const router = useRouter()
    useEffect(() => {
        if(!fetching && !data?.me){
            router.replace('/login')
        }
    }, [data, fetching, router])
}