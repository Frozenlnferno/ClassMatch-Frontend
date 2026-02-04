// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import useSession from "../auth/useSession";
// import { joinGroupByInviteCodeURL } from "./service";
// import logger from "../../utils/logger";

// export default function JoinGroupPage() {
//   const { inviteCode } = useParams();
//   const navigate = useNavigate();
//   const { session, isSessionLoading } = useSession();

//   const [status, setStatus] = useState("joining"); // joining | done | error
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const run = async () => {
//       if (isSessionLoading) return;

//       if (!session) {
//         // Redirect to login, and preserve where they were trying to go
//         navigate(`/login?next=${encodeURIComponent(`/groups/join/${inviteCode}`)}`);
//         return;
//       }

//       try {
//         setStatus("joining");
//         setError(null);

//         // Call backend to join and return groupId (or group object)
//         const data = await joinGroupByInviteCodeURL(inviteCode);

//         setStatus("done");
      
//         // Send them to the actual group page after joining
//         if (data?.group_id) {
//             navigate(`/groups/${data.group_id}`);
//         } else {
//             navigate(`/groups/2`);
//         }
        
//       } catch (e) {
//         logger.error(e);
//         setStatus("error");
//         setError(e?.message || "Failed to join group");
//       }
//     };

//     run();
//   }, [inviteCode, session, isSessionLoading, navigate]);

//   if (status === "joining") return <div className="p-6">Joining group...</div>;
//   if (status === "error") return <div className="p-6 text-red-600">{error}</div>;

//   return <div className="p-6">Joined. Redirecting...</div>;
// }
