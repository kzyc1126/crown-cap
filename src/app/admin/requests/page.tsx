import Image from "next/image";
import Link from "next/link";
import { ConfirmButton } from "@/components/admin";
import { Frame } from "@/components/ui";
import { formatDate, formatYear } from "@/lib/format";
import { offeredCapSpecs } from "@/lib/trade";
import {
  acceptTradeRequest,
  declineTradeRequest,
  deleteRequest,
  setRequestStatus,
} from "@/server/actions";
import { getTradeRequests } from "@/server/queries";

export const metadata = { title: "Trade requests" };

export default async function AdminRequestsPage() {
  const requests = await getTradeRequests();

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-baseline gap-4">
        <h2 className="text-[28px]">Trade requests</h2>
        <span className="ovr dimmer">{requests.length} total</span>
      </div>

      {requests.length === 0 ? (
        <Frame className="p-10 text-center">
          <p className="dim m-0">
            Nothing yet. Requests sent from the{" "}
            <Link href="/trade">trade form</Link> land here.
          </p>
        </Frame>
      ) : null}

      {requests.map((request) => (
        <Frame key={request.id} className="p-6">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 24 }}>
                {request.name}
              </div>
              <div className="ovr dimmer mt-1">
                {request.contact} · {formatDate(request.createdAt)}
              </div>
            </div>

            <div className="ml-auto flex flex-wrap items-center gap-2">
              <span
                className="ovr px-3 py-2"
                style={{
                  border: "1px solid var(--line)",
                  color:
                    request.status === "new"
                      ? "var(--accent-strong)"
                      : "color-mix(in srgb, var(--fg) 55%, transparent)",
                }}
              >
                {request.status}
              </span>

              {/* Accepting moves caps between collections, so it is only ever
                  offered on a request still waiting — and asks twice. */}
              {request.status === "new" ? (
                <>
                  <form action={acceptTradeRequest}>
                    <input type="hidden" name="id" value={request.id} />
                    <ConfirmButton
                      label="Accept"
                      confirmLabel="Tap again to accept"
                    />
                  </form>
                  <form action={declineTradeRequest}>
                    <input type="hidden" name="id" value={request.id} />
                    <button type="submit" className="btn quiet">
                      Decline
                    </button>
                  </form>
                </>
              ) : (
                <form action={setRequestStatus}>
                  <input type="hidden" name="id" value={request.id} />
                  <input type="hidden" name="status" value="new" />
                  <button type="submit" className="btn quiet">
                    Reopen
                  </button>
                </form>
              )}

              <form action={deleteRequest}>
                <input type="hidden" name="id" value={request.id} />
                <ConfirmButton />
              </form>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {request.items.map((item) => (
              <div key={item.id} className="border border-line p-4">
                <div className="ovr dimmer">Wants</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 21 }}>
                  <Link href={`/admin/caps/${item.capId}`}>{item.cap.name}</Link>
                </div>
                <div className="dim text-[13px]">
                  {item.cap.ref} · {item.cap.country} · {formatYear(item.cap.year)}
                </div>

                <div className="ovr dimmer mt-4">Offers</div>
                {item.offeredCap ? (
                  <>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 21 }}>
                      {item.offeredCap.name}
                      <span className="dim text-[13px]">
                        {" "}
                        · {item.offeredCap.country}
                      </span>
                    </div>
                    <div className="ovr dimmer mt-1" style={{ fontSize: 10 }}>
                      Off the wishlist — already catalogued
                    </div>
                  </>
                ) : item.offerName ? (
                  <>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 21 }}>
                      {item.offerName}
                    </div>
                    <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4">
                      {offeredCapSpecs(item).map(([key, value]) => (
                        <div key={key} className="contents">
                          <dt className="ovr dimmer py-0.5" style={{ fontSize: 10 }}>
                            {key}
                          </dt>
                          <dd className="m-0 py-0.5 text-[13px]">{value}</dd>
                        </div>
                      ))}
                    </dl>
                    {item.offerNote ? (
                      <p className="dim m-0 mt-3 text-[13px] leading-relaxed">
                        {item.offerNote}
                      </p>
                    ) : null}
                  </>
                ) : (
                  <p className="m-0 text-[14px] leading-relaxed">
                    {item.offerNote || "—"}
                  </p>
                )}

                {item.offerImage ? (
                  <div className="relative mt-3 h-32 w-32 overflow-hidden border border-line">
                    <Image
                      src={item.offerImage}
                      alt={`Photo offered for ${item.cap.name}`}
                      fill
                      sizes="128px"
                      className="object-cover"
                    />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </Frame>
      ))}
    </div>
  );
}
