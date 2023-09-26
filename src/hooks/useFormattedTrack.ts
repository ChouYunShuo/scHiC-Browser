// import { useRef, useEffect, useState } from "react";

// export const useFormattedTrack = (
//   isLoading: boolean,
//   rawEmbedData: string,
//   res: number
// ) => {
//   const [formattedData, setFormattedData] = useState<number[]>([]);
//   useEffect(() => {
//     if (!isLoading && rawEmbedData) {
//       const formattedData = rawEmbedData.map(([pc1, pc2, cellType], index) => ({
//         pc1: typeof pc1 === "string" ? parseFloat(pc1) : pc1,
//         pc2: typeof pc2 === "string" ? parseFloat(pc2) : pc2,
//         cellType,
//         cellId: index.toString(),
//         selectMap: "0",
//       }));
//     }
//   }, [isLoading, rawEmbedData]);

//   return { canvasRef, mapInstance };
// };
